import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  GatewayMetadata,
  WsException,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebplayerService } from './webplayer.service';
import { Logger, UseGuards, ForbiddenException } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { User } from '../auth/entities/user.entity';
import { WsAuthGuard } from '../auth/decorators/websocket.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ExecCtxTypeEnum } from '../auth/interfaces/executionContext.enum';
import { Session } from '../session/interfaces/session.interface';
import * as _ from 'lodash';

@WebSocketGateway(<GatewayMetadata>{ path: '/v1/webplayer', transports: ['websocket'] })
export class WebplayerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('WebplayerGateway');

  constructor(private readonly webplayerService: WebplayerService, private readonly sessionService: SessionService) {}

  @WebSocketServer()
  private readonly server: Server;

  async handleConnection(socket: Socket) {
    const jwtToken = <string>socket.handshake.query.token.replace('Bearer ', '');
    const session = await this.getSessionFromSocketQueryId(socket);
    // IMPORTANT: join the correct room uuid
    socket.join(session.id);
    const user = _.omit(await this.webplayerService.getUserUsingJwtToken(jwtToken), [
      'email',
      'accessToken',
      'refreshToken',
      'subscription',
      'tokenVer',
    ]);
    if (!session.currentDJ && session.connectedUsers.length === 0) {
      session.currentDJ = user;
      session.startsAt = Date.now();
      session.endsAt = Date.now() + 10 * 60 * 1000;
    }
    console.log(session);
    session.connectedUsers.push(user);
    this.logger.verbose(`A user has connected! Current number of users: ${session.connectedUsers.length}`);
    this.server.to(socket.id).emit('receiveCurrentSession', session);
    this.server.to(session.id).emit('receiveUsers', session.connectedUsers);
    // Set the song start after the broadcast, because DJ doesnt need to know when the song starts
    session.webplayer.songStartedAt = Date.now();
    await this.sessionService.updateSession(session);
    console.log(session);
  }

  async handleDisconnect(socket: Socket) {
    const jwtToken = <string>socket.handshake.query.token.replace('Bearer ', '');
    const session = await this.getSessionFromSocketQueryId(socket);
    const user = await this.webplayerService.getUserUsingJwtToken(jwtToken);
    session.connectedUsers = session.connectedUsers.filter((val) => val.id !== user.id);
    if (user.id === session.currentDJ.id) {
      session.connectedUsers.length > 0 ? await this.selectNewDJ(user, socket) : (session.currentDJ = undefined);
      this.server.to(session.id).emit('receiveNewDJ', session.currentDJ);
    }
    this.logger.verbose(`A user has disconnected! Current number of users: ${session.connectedUsers.length}`);
    this.server.to(session.id).emit('receiveUsers', session.connectedUsers);
    await this.sessionService.updateSession(session);
    // gracefully exit the room
    socket.leave(session.id);
    return socket.disconnect();
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getSession')
  async getSession(@ConnectedSocket() socket: Socket) {
    const session = await this.getSessionFromSocketQueryId(socket);
    this.server.to(session.id).emit('receiveCurrentSession', session);
    await this.sessionService.updateSession(session);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getUsers')
  async getUsers(@ConnectedSocket() socket: Socket) {
    const session = await this.getSessionFromSocketQueryId(socket);
    this.server.to(session.id).emit('receiveUsers', session.connectedUsers);
    await this.sessionService.updateSession(session);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getSongStart')
  async getSongStart(@ConnectedSocket() socket: Socket) {
    const session = await this.getSessionFromSocketQueryId(socket);
    this.server.to(session.id).emit('receiveCurrentSongStart', session.webplayer.songStartedAt);
    await this.sessionService.updateSession(session);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getSongPause')
  async getSongPause(@ConnectedSocket() socket: Socket) {
    const session = await this.getSessionFromSocketQueryId(socket);
    this.server.to(session.id).emit('receiveCurrentSongPause', session.webplayer.songPausedAt);
    await this.sessionService.updateSession(session);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('rebroadcastSelectedURI')
  async onURIChange(@MessageBody() uris: string[], @GetUser(ExecCtxTypeEnum.WEBSOCKET) user: User, @ConnectedSocket() socket: Socket) {
    const session = await this.getSessionFromSocketQueryId(socket);
    this.isPermittedForUser(user, session);
    session.currentURI = uris;
    this.logger.verbose(`Newly selected URI: ${session.currentURI}`);
    this.server.to(session.id).emit('receiveCurrentURI', session.currentURI);
    this.server.to(session.id).emit('receiveCurrentSongStart', session.webplayer.songStartedAt);
    session.webplayer.songStartedAt = Date.now();
    await this.sessionService.updateSession(session);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('selectNewDJ')
  async selectNewDJ(@GetUser(ExecCtxTypeEnum.WEBSOCKET) user: User, @ConnectedSocket() socket: Socket) {
    const session = await this.getSessionFromSocketQueryId(socket);
    this.isPermittedForUser(user, session);
    const connectedUsersWithoutDJ = session.connectedUsers.filter((val) => val.id !== user.id);
    session.currentDJ = _.sample(connectedUsersWithoutDJ);
    session.startsAt = Date.now();
    this.server.to(session.id).emit('receiveNewDJ', session.currentDJ);
    await this.sessionService.updateSession(session);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('updateWebplayerState')
  async setWebplayerState(
    @MessageBody() state: boolean,
    @GetUser(ExecCtxTypeEnum.WEBSOCKET) user: User,
    @ConnectedSocket() socket: Socket
  ) {
    const session = await this.getSessionFromSocketQueryId(socket);
    this.isPermittedForUser(user, session);
    if (!state) {
      // TODO: there might be a big timing gap between the pause and spotify pausing the song, we need to check if the UX fits well enough for the technical problem
      session.webplayer.songPausedAt = Date.now();
    } else {
      session.webplayer.songStartedAt = session.webplayer.songStartedAt + (Date.now() - session.webplayer.songPausedAt);
      session.webplayer.songPausedAt = undefined;
    }
    session.webplayer.isPlaying = state;
    this.server.to(session.id).emit('receiveCurrentWebplayerState', session.webplayer.isPlaying);
    await this.sessionService.updateSession(session);
  }

  async getSessionFromSocketQueryId(socket: Socket): Promise<Session> {
    const id = <string>socket.handshake.query.sessionId;
    return await this.sessionService.getSessionById(id);
  }

  private isPermittedForUser(user: User, session: Session) {
    if (user.id !== session.currentDJ.id) {
      throw new WsException(ForbiddenException);
    }
  }
}

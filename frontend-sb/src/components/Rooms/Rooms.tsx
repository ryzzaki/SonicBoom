import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { fetchSessions } from '../../utils/api';
import { Link } from '@reach/router';
import { Modal } from './Modal';
import { Header } from '../Landing/Header';
import { Footer } from '../Landing/Footer';

type Props = {};

export const Rooms: React.FC<Props> = (props) => {
  const {} = props;

  const { token } = useContext(AuthContext);

  const [rooms, setRooms] = useState([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const { data } = await fetchSessions(token);
        setRooms(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className="bg-black2 text-white px-80 min-h-screen flex flex-col relative">
      {modal && <Modal token={token} closeModal={() => setModal(false)} />}
      {/* <nav className="bg-skinpink flex py-30">
        <h1 className="text-30 text-white font-bold">Explore rooms</h1>
        <button
          onClick={() => setModal(true)}
          className="ml-auto bg-green text-white font-bold text-14
                px-20 py-5 rounded-full uppercase"
        >
          Create a room
        </button>
      </nav> */}
      <Header noLogin />
      <main className="flex-wrap content-center justify-center flex-1 pt-20 pb-80">
        <h1 className="text-40 font-bold my-40">Explore rooms</h1>
        {!rooms.length && (
          <p className="text-pink text-30">No rooms (ノಠ益ಠ)ノ彡┻━┻</p>
        )}
        <div className="grid grid-cols-5">
          {rooms.map((room: any) => (
            <Link
              key={room.id}
              to={`/party?sessionId=${room.id}`}
              className="bg-black2light rounded-lg group group hover:bg-white p-20 cursor-pointer"
            >
              <img
                className="rounded-lg"
                src="https://i.scdn.co/image/ab67706f00000002bf4545e8d7e6b7e377980995"
              />
              <h4 className="group-hover:text-black font-bold text-24 pt-20 pb-10 text-white">
                {room.name}
              </h4>
              <p className="group-hover:text-darkblue text-greylight">
                {room.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

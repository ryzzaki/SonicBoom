import React from 'react';
import spotifyLogo from '../assets/icons/spotifyLogo.svg';

const Header: React.FC = (props) => {
  return (
    <header className="bg-darkgray">
      <div className="flex flex-no-wrap justify-between">
        <div className="flex-auto w-1/2 text-center md:text-left">
          <h1 className="font-logoHeading text-34 text-white px-25 py-15">
            Sonic Boom{' '}
            <span className="font-body text-14 md:text-18">v1.0</span>
          </h1>
        </div>
        <div className="flex hidden md:flex w-1/2 justify-end m-10 mr-25">
          <button className="bg-darkgray hover:bg-gray text-green hover:text-green border border-green font-heading py-5 px-10 rounded">
            <img
              className="inline mr-3 bg-transparent rounded-full"
              src={spotifyLogo}
              width="15"
              height="15"
              alt="Spotify Logo"
            />
            Login with Spotify
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useEffect, useContext } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import { AuthContext } from '../context/AuthContext';
import { fetchUser, signOutUser } from '../utils/api';
import { gaSetUser } from '../utils/analytics';

type Props = {};

export const RedirectPage: React.FC<RouteComponentProps<Props>> = (props) => {
  const { location } = props;

  const { setToken, setUser } = useContext(AuthContext);

  useEffect(() => {
    async function fetchUserAndRedirect(token: string) {
      try {
        const { data } = await fetchUser(token);
        setUser(data);
        setToken(token);
        gaSetUser(data.id);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('access_key');
        setToken('');
        setUser({});
        signOutUser();
      }
    }
    if (location?.hash) {
      const access_token = location?.hash.replace('#access_token=', '');
      localStorage.setItem('access_key', access_token);
      fetchUserAndRedirect(access_token);
    } else {
      navigate('/');
    }
  }, []);

  return <h1 className="mt-30 text-center text-white">loading...</h1>;
};

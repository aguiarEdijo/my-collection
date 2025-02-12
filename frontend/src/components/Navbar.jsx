import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Menu mode="horizontal" theme="dark">

      {token && (
        <Menu.Item key="logout" onClick={handleLogout}>
          Sair
        </Menu.Item>
      ) }
    </Menu>
  );
};

export default Navbar;
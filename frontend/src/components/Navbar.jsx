import React from 'react';
import { Menu } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const items = [
    token && {
      key: 'logout',
      label: <span onClick={handleLogout} style={{ fontWeight: 'bold', fontSize:'20px', textDecoration: 'underline' }}>Sair</span>,
    },
  ].filter(Boolean);

  return (
    <Menu mode="horizontal" theme="ligth" style={{ justifyContent: 'flex-end' }} items={items} />
  );
};

export default Navbar;

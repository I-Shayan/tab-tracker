import React from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';

export default function Navbar() {
	return (
		<header>
			<nav className="navbar">
				<Link to="/">
					<img className="icon" src="/icon.png" alt="Icon" />
				</Link>
			</nav>
		</header>
	);
}

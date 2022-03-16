import React, {useState} from 'react';
import { Nav, Navbar, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
//import { useTranslation } from 'react-i18next';
import toast from '../Toast/Toast';
import './AppNav.css';
import identityImage from "../../assets/identity-image.png";

import {
	SignerService
} from "iam-client-lib";

type Props = {
	account: string;
	chain: string;
};

function AppNav({ account, chain }: Props) {
	let signerService: SignerService;
	const userDID = localStorage.getItem("did") || "";
	const [did, setDID] = useState<string>(userDID);
	const shortDid = `${did.slice(0, 6)}...${did.slice(-4)}`;
	let navigate = useNavigate();

	const onClickAccount = () => {
		navigator.clipboard.writeText(did);
		//toast("ADDRESS COPIED");
	}

	const logout = async function() {
		console.log("LOGGING OUT");
		signerService && (await signerService.closeConnection());
		setDID("");
		localStorage.clear();
		navigate("/");
	};

	return (
		<Navbar bg="primary" variant="dark" expand="lg" className="p-3">
			<Navbar.Brand href="#home">Dapp showcase iam-client-lib</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="me-auto">
					<Nav.Link href="#home">Home</Nav.Link>					
				</Nav>
				<Nav className="connection-info">
					
						<Dropdown>
						  <Dropdown.Toggle id="dropdown-basic">
							Nome Utente <img src={identityImage} width="34" height="34" className="rounded-circle"/>
						  </Dropdown.Toggle>
						
						  <Dropdown.Menu>
						    {did && <Dropdown.Item onClick={onClickAccount}>{shortDid}</Dropdown.Item> }
						    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
						    <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
						  </Dropdown.Menu>
						</Dropdown>
										
					{chain && (<p className="chain-info">{chain}</p>)}					
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	);
}

export default AppNav;

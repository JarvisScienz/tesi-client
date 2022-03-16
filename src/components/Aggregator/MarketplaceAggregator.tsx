import React, { useEffect, useState } from "react";
import { config } from "../../config";
import AppNav from '../AppNav/AppNav';
import { Table, Spinner, Dropdown, Modal, Container, Col, Row, Button } from 'react-bootstrap';
import {
	initWithEKC,
	initWithGnosis,
	initWithMetamask,
	initWithPrivateKeySigner,
	initWithWalletConnect,
	ProviderType,
	setCacheConfig,
	setChainConfig,
	Asset,
	AssetHistory
} from "iam-client-lib";

import {
	VOLTA_IDENTITY_MANAGER_ADDRESS,
} from "@energyweb/iam-contracts";
import { abi } from '../../assets/json/IdentityManager.abi.json';
import IdentityManager from '../../types/IdentityManager';

import { ethers } from "ethers";

import "../../App.css";
import logo from "../../assets/logo.svg";
import threeDots from "../../assets/3-vertical-dots.svg";

import { safeAppSdk } from "../../gnosis.safe.service";

const { chainRpcUrl, chainId, cacheServerUrl } = config;

setCacheConfig(chainId, { url: cacheServerUrl });
setChainConfig(chainId, { rpcUrl: chainRpcUrl });

/*type Props = {
	signerService: SignerService;
};*/

function MarketplaceAggregator() {
	const myAddress = '0xd60358a7c889C889B471aACF90b4A0D1C8c8e0D3';
	//let signerService: SignerService;
	const [creatingAsset, setCreatingAsset] = useState(false);
	const userDID = localStorage.getItem("did") || "";
	const [did, setDID] = useState<string>(userDID);
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	//let claimsService: ClaimsService;
	//const [search, setSearch] = React.useState({ account: '' });
	const [account/*, setAccount*/] = useState<string>("");
	const [chain/*, setChain*/] = useState<string>("");
	const [assets, setAssets] = useState<Asset[]>([]);
	//let assets: Asset[];
	//let assets : Asset[];
	const [loading, setLoading] = useState(false);
	const headers = ["Data creazione", "Nome", "DID", "Offered to", "Ultimo aggiornamento", ""];
	const [modalAssetHistoryShow, setModalAssetHistoryShow] = useState(false);
	const [modalTransferOwnershipShow, setModalTransferOwnershipShow] = useState(false);
	const [parameterModal, setParameterModal] = useState<Asset>();
	
	useEffect(() => {
		const getAssets = async () => {
			setLoading(true);
			const { signerService, connectToCacheServer } = await initSignerService(ProviderType.MetaMask);
			const { assetsService } = await connectToCacheServer();
			console.log("Did: " + did);
			let assets = (await assetsService.getOwnedAssets({
				did: did,
			}))
			let offeredAssets = (await assetsService.getOfferedAssets({
				did: did,
			}))
			setAssets(Array.from(new Set([...assets, ...offeredAssets])));
			//console.log("Address: " + signerService.address);
			//console.log("Assets: " + JSON.stringify(assets));
			//console.log("Offered Assets: " + JSON.stringify(offeredAssets));	
			setLoading(false);
		};
		getAssets();
	}, [setAssets]);


	/*const onCreateAsset = async () => {
		setCreatingAsset(true);
		const identityManagerContract = new ethers.Contract(abi as AbiItem[], VOLTA_IDENTITY_MANAGER_ADDRESS) as unknown as IdentityManager;
		const contract = await ethers.Contract.g
		identityManagerContract.once('IdentityCreated', (err, identity) =>
			err ? console.error(err) : setAssets([...assets, new Asset(identity.returnValues.identity, account)])
		);
		try {
			await identityManagerContract.methods.createIdentity(account).send({ from: account });
		} catch (e: any) {
			console.error(e);
			//toastMetamaskError(e, t);
		}
		setCreatingAsset(false);
	}*/

	const callContract = async () => {
		setCreatingAsset(true);
		//signer = new ethers.VoidSigner(myAddress, provider);		
		const signer = provider.getSigner();
		//console.log("Signer: " + JSON.stringify(signer));
		const identityManagerContract = new ethers.Contract(VOLTA_IDENTITY_MANAGER_ADDRESS, abi, signer) as unknown as IdentityManager;
		identityManagerContract.once('IdentityCreated', (err, identity) =>
			err ? console.error(err) : console.log("Identity: " + identity.returnValues.identity + "Identity: " + JSON.stringify(identity))
		);
		try {
			await identityManagerContract.createIdentity(myAddress).send({ from: myAddress });
		} catch (e: any) {
			console.error(e);
		}
		//console.log(JSON.stringify(identityManagerContract));
		setCreatingAsset(false);
	}

	const initSignerService = async function(providerType: ProviderType) {
		switch (providerType) {
			case ProviderType.MetaMask:
				return initWithMetamask();
			case ProviderType.WalletConnect:
				return initWithWalletConnect();
			case ProviderType.PrivateKey:
				return initWithPrivateKeySigner(
					localStorage.getItem("PrivateKey") as string,
					chainRpcUrl
				);
			case ProviderType.Gnosis:
				return initWithGnosis(safeAppSdk);
			case ProviderType.EKC:
				return initWithEKC();
			default:
				throw new Error(`no handler for provider '${providerType}'`);
		}
	};



	const getAssetInformations = async function(id: string) {
		const { signerService, connectToCacheServer } = await initSignerService(ProviderType.MetaMask);
		const { assetsService } = await connectToCacheServer();
		/*const assetDetails = await assetsService.getAssetById({
			id: "did:ethr:volta:0xf516cCc0008912009f48EE9D17E2e2efEa1C9D09",
		})
		console.log("Asset details: " + JSON.stringify(assetDetails));*/
		const assetHistory = await assetsService.getAssetHistory({
			id: id,//"did:ethr:volta:0xf516cCc0008912009f48EE9D17E2e2efEa1C9D09",
		})
		console.log("Asset history: " + JSON.stringify(assetHistory));
		return assetHistory;
	};
	
	function testAPI(){
		fetch("https://volta-identitycache.energyweb.org/v1/assets/history/did:ethr:0xf516cCc0008912009f48EE9D17E2e2efEa1C9D09", {
		  "method": "GET",
		  "headers": {
		    "content-type": "text/html",
		    "accept": "text/html",
			"Cookie": "token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkaWQiOiJkaWQ6ZXRocjoweGQ2MDM1OGE3Yzg4OUM4ODlCNDcxYUFDRjkwYjRBMEQxQzhjOGUwRDMiLCJ2ZXJpZmllZFJvbGVzIjpbeyJuYW1lIjoiYWdncmVnYXRvciIsIm5hbWVzcGFjZSI6ImFnZ3JlZ2F0b3Iucm9sZXMudGVzaS5pYW0uZXdjIn1dLCJvcmlnaW4iOiJodHRwczovL3ZvbHRhLXN3aXRjaGJvYXJkLmVuZXJneXdlYi5vcmciLCJpYXQiOjE2NDczNjU5NDEsImV4cCI6MTY0NzM2Njg0MX0.Qp-geVbABrhybBSMIHz4-S4Gt2s_PaEQRAv8446UnocPL-0KmvT7SJUo8EVQRpxUDhHPAiKW772LXpgts0ekd2e7gnIp3pMxIJt6RVyMRmSWwKyzNYWzLBfz9wpCkjIOgfhOXG_1mNZ7M119SmQQE_VZyIWk-sprgGBgEvj581hGHXRYSfEQ9WiEJZodFZvyWA_DNB05XDsDw_ScJA1oQjsbmThxc_C6Ui-EfeluNT-qd40KeYdQluh_cfLexXw32J8d1JgMJ2BesOYZ5y7pRWg3nAcMS00b2su91PC-ej5Df629VzTVkxLczRGoqchxZSbiVRRKMzLMzu_6vbAQOg; refreshToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbklkIjoiMDYyYWMxZjUtM2Y4Yy00OTVhLWI1MmUtN2ExN2VhZjIyMmVlIiwiaXNSZXZva2VkIjpmYWxzZSwidXNlckRpZCI6ImRpZDpldGhyOjB4ZDYwMzU4YTdjODg5Qzg4OUI0NzFhQUNGOTBiNEEwRDFDOGM4ZTBEMyIsImlhdCI6MTY0NzM2NTk0MSwiZXhwIjoxNjQ3MzY5NTQxfQ.TlKdzpadMYyB0IE77xf94XbGgCxESnyMQVS4QWJKKUfSAzD8-KtM2gldh26hkqTGnHwtIabODuif-3V5KeBiG3Q_pcN1_unOhd4x3jbQtfdkc35dsqwTuvM0bHtdlrYoKTrQTILSAgIB04LgzBI1HN1Mu0h581F6E_0MyJom1R05yjFf_uBGQS_4wNmBo_RfsxRYBsNDrgolNflF1gCW1CVJqtv-sSdOePGsTlr09IAapq1GFPrLEGZazqn9Hrqy19UJnc1BORImmvVK7VVPRTbX41WFPthezqDqyEMAAebNLGXE_b4ri-8KJL_PiEHBi0XrB4v0R5u6cGuv1x10-g; __cf_bm=Y6aa0BPJ1OUYmwZwKHziuksP4Aks4ehGu_VdDgbVPPc-1647365572-0-AZN6pezgzUddiIE6nvFW6hur/b2y7Qxq/IGPNqywR6tSZlUbqyMsrtqgVTrCcinylhBJPRR0j4DlL7gJRHjAgsrZmR9DMxnGQG3RNfADm38ks+5zRS4pXHLe22Hcrarl5w=="
		  }
		})
		.then(response => response.json())
		.then(response => {
		  console.log(response)
		})
		.catch(err => {
		  console.log(err);
		});
	}
	
	const transferOwnership = async function(assetDID: string, offertTo: string){
		const { signerService, connectToCacheServer } = await initSignerService(ProviderType.MetaMask);
		const { assetsService } = await connectToCacheServer();
		await assetsService.offerAsset({
			assetDID: assetDID,
        	offerTo: offertTo
		})
	}
	
	function ModalAssetHistory(props) {
		let id = "";
		let assetHistory = [];
		if (props.data !== undefined){
			id = props.data.id
			assetHistory = getAssetInformations(id);	
		}			
	  return (
	    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered>
	      <Modal.Header closeButton>
	        <Modal.Title id="contained-modal-title-vcenter">
	          Storico asset <h6>{id}</h6>
	        </Modal.Title>
	      </Modal.Header>
	      <Modal.Body className="show-grid">
	        <Container>
	            {(assetHistory == []) ? (
					<Row> {assetHistory.toString} </Row> 
				) : (
					<Row>Storico asset vuoto</Row>
				)}
	        </Container>
	      </Modal.Body>
	      <Modal.Footer>
	        <Button onClick={props.onHide}>Close</Button>
	      </Modal.Footer>
	    </Modal>
	  );
	}
	
	function ModalTransferOwnership(props) {
		let id = "";		
		if (props.data !== undefined){
			id = props.data.id
		}			
	  return (
	    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered>
	      <Modal.Header closeButton>
	        <Modal.Title id="contained-modal-title-vcenter">
	          Trasferimento propriet&agrave; <h6>{id}</h6>
	        </Modal.Title>
	      </Modal.Header>
	      <Modal.Body className="show-grid">
	        <Container>	            
				<input type="text"></input>
	        </Container>
	      </Modal.Body>
	      <Modal.Footer>
	        <Button onClick={() => transferOwnership(id, '0xdc2dF0A289D610546a8cDb4d15fbE1831Aba822F')}>Trasferisci</Button>
			<Button onClick={props.onHide}>Close</Button>
	      </Modal.Footer>
	    </Modal>
	  );
	}
	
	const openModalAssetHistory = function(modalShow:boolean, asset: Asset){
		setModalAssetHistoryShow(true);
		setParameterModal(asset);
	}
	
	const openModalTransferOwnership = function(modalShow:boolean, asset: Asset){
		setModalTransferOwnershipShow(true);
		setParameterModal(asset);
	}

	const renderAssets = () => {		
		console.log("assets: " + JSON.stringify(assets));
		if (loading) {
			return <div className="text-center mt-2"><Spinner animation="border" /></div>
		}
		if (assets.length === 0) {
			return (
				<div className="text-center mt-2">
					<p>Non sono presenti asset</p>
				</div>
			);
		}		
		return assets.map(asset => (
			<tr>
				<th>{asset.createdAt}</th>
				<th></th>
				<th>{asset.id}</th>
				<th>{asset.offeredTo}</th>
				<th>{asset.updatedAt}</th>
				<th>
					<Dropdown>
					  <Dropdown.Toggle id="dropdown-basic">
						<img src={threeDots} width="20" height="20"/>
					  </Dropdown.Toggle>
					
					  <Dropdown.Menu>
					    <Dropdown.Item onClick={() => openModalAssetHistory(true, asset) }>Storico asset</Dropdown.Item>
					    <Dropdown.Item onClick={() => openModalTransferOwnership(true, asset) }>Trasferimento propriet&agrave;</Dropdown.Item>
					  </Dropdown.Menu>
					</Dropdown>
				</th>
			</tr>
		))		
	}



	return (
		<div className="App">
			<header>
				<AppNav account={account} chain={chain}></AppNav>
			</header>
			<img src={logo} className="App-logo" alt="logo" />
			<h2>Aggregatore</h2>
			<div className="logoutContainer">
				<button onClick={callContract} disabled={creatingAsset}>
					<i className="fa fa-plus"></i><span>Contract</span>
				</button>
			</div>
			<Table responsive>
				<thead>
					<tr>
						{headers.map((header, index) => (
							<th key={index}>{header}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{renderAssets()}
				</tbody>
			</Table>
			<ModalAssetHistory show={modalAssetHistoryShow} onHide={() => setModalAssetHistoryShow(false)} data={parameterModal} />
			<ModalTransferOwnership show={modalTransferOwnershipShow} onHide={() => setModalTransferOwnershipShow(false)} data={parameterModal} />
		</div>
	);
}

export default MarketplaceAggregator;

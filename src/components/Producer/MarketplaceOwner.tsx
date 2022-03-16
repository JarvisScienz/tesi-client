import React, { useState } from "react";
import { config } from "../../config";

import {
	initWithEKC,
	initWithGnosis,
	initWithMetamask,
	initWithPrivateKeySigner,
	initWithWalletConnect,
	ProviderType,
	setCacheConfig,
	setChainConfig,
	SignerService,
	ClaimsService,
	DidRegistry,
	ClaimData
} from "iam-client-lib";

import {
	VOLTA_IDENTITY_MANAGER_ADDRESS,
} from "@energyweb/iam-contracts";
import { abi } from '../../assets/json/IdentityManager.abi.json';

import IdentityManager from '../../types/IdentityManager';

import { ethers, providers } from "ethers";

import SourceCode from "../../components/SourceCode";

import "../../App.css";
import logo from "../../assets/logo.svg";

import { safeAppSdk } from "../../gnosis.safe.service";

const { chainRpcUrl, chainId, cacheServerUrl } = config;

setCacheConfig(chainId, { url: cacheServerUrl });
setChainConfig(chainId, { rpcUrl: chainRpcUrl });

/*type Role = {
	name: string;
	namespace: string;
};*/

function MarketplaceOwner() {
	const myDid = 'did:ethr:volta:0xdc2dF0A289D610546a8cDb4d15fbE1831Aba822F';
	const myAddress = '0xdc2dF0A289D610546a8cDb4d15fbE1831Aba822F';
	let signerService: SignerService;
	const userDID = localStorage.getItem("did") || "";
	const [did, setDID] = useState<string>(userDID);
	//let signer: Signer;
	const [creatingAsset, setCreatingAsset] = useState(false);
	//const provider = new providers.JsonRpcProvider("https://volta-rpc.energyweb.org");	
	//const provider = new providers.JsonRpcProvider();
	const provider = new ethers.providers.Web3Provider(window.ethereum);	
	let claimsService : ClaimsService;	
	//const [assets, setAssets] = useState<Asset[]>([]);

	(async () => {})();


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

	const getAssets = async () => {		
		const { signerService, messagingService, connectToCacheServer } = await initSignerService(ProviderType.MetaMask);
			const {
				domainsService,
				stakingPoolService,
				assetsService,
				connectToDidRegistry,
				cacheClient,
			} = await connectToCacheServer();
		const { didRegistry, claimsService } = await connectToDidRegistry();
		const assets = await assetsService.getOwnedAssets({
          did: myDid,
        })
		
		console.log("Assets: " + JSON.stringify(assets));
	}
	
	const getAssets2 = async () => {
		const signer = provider.getSigner();
		let identityManagerContract = new ethers.Contract(VOLTA_IDENTITY_MANAGER_ADDRESS, abi, signer) as unknown as IdentityManager;		
		/*identityManagerContract.on("IdentityCreated", {
                filter: { myAddress },
                fromBlock: 0
         });*/		
		    
		//MetaMask - RPC Error: Internal JSON-RPC error.
		/*const identityCreated = await identityManagerContract.identityCreated(myAddress);
		console.log("createIdentity: " + JSON.stringify(identityCreated));*/
		/*const identityCreated = await identityManagerContract.getPastEvents('IdentityCreated', {
                filter: { myAddress },
                fromBlock: 'earliest',
                toBlock: 'latest'
            });*/
		//MetaMask - RPC Error: Internal JSON-RPC error.
		//const identityAccepted = await identityManagerContract.identityAccepted(myAddress);
		//console.log("identityAccepted: " + JSON.stringify(identityAccepted));
		const compliant = await identityManagerContract.compliant("0x16577fde9A97dA4bE603748EA22A56e274aEE1A0");
		console.log("compliant: " + JSON.stringify(compliant));
		
		const verified = await identityManagerContract.verified(myAddress);
		console.log("verified: " + JSON.stringify(verified));
		
		const identityOwner = await identityManagerContract.identityOwner("0x16577fde9A97dA4bE603748EA22A56e274aEE1A0");
		console.log("identityOwner: " + JSON.stringify(identityOwner));
		/*const assetsCreated = await identityManagerContract.getPastEvents('IdentityCreated', {
                filter: { myAddress },
                fromBlock: 'earliest',
                toBlock: 'latest'
            });*/
	}
	
	const getAssetInformations = async function() {
		const { signerService, connectToCacheServer } = await initSignerService(ProviderType.MetaMask);
		const { assetsService } = await connectToCacheServer();
		/*const assetDetails = await assetsService.getAssetById({
			id: "did:ethr:volta:0xf516cCc0008912009f48EE9D17E2e2efEa1C9D09",
		})
		console.log("Asset details: " + JSON.stringify(assetDetails));*/
		const assetHistory = await assetsService.getAssetHistory({
			id: "did:ethr:volta:0xf516cCc0008912009f48EE9D17E2e2efEa1C9D09",
		})
		console.log("Asset history: " + JSON.stringify(assetHistory));
	};
	
	const logout = async function() {
		console.log("LOGGING OUT");
		signerService && (await signerService.closeConnection());
		setDID("");
		localStorage.clear();
	};


	return (
		<div className="App">
			<img src={logo} className="App-logo" alt="logo" />
			<h2>Produttore</h2>
			<div className="logoutContainer">
				<button onClick={callContract} disabled={creatingAsset}>
					<i className="fa fa-plus"></i><span>Contract</span>
				</button>
				<button onClick={getAssets} disabled={creatingAsset}>
					<i className="fa fa-plus"></i><span>Get assets</span>
				</button>
				<button onClick={getAssets2} disabled={creatingAsset}>
					<i className="fa fa-plus"></i><span>Get assets 2</span>
				</button>
				<button onClick={getAssetInformations} disabled={creatingAsset}>
					<i className="fa fa-plus"></i><span>Get asset information</span>
				</button>
			</div>
			<div className="logoutContainer">
				<button onClick={logout} className="button">
					<span>Logout</span>
				</button>
			</div>
			<SourceCode />
		</div>
	);
}

export default MarketplaceOwner;

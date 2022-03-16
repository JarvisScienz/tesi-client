import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "./config";
import { HashRouter as Router, Route, Link, useNavigate } from 'react-router-dom';

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
	DomainReader,
	VOLTA_ENS_REGISTRY_ADDRESS,
} from "@energyweb/iam-contracts";

/*import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { IDIDDocumentLite } from '@ew-did-registry/did-document';*/
import {
	IDIDDocument, IServiceEndpoint
} from '@ew-did-registry/did-resolver-interface';

import { providers, utils } from "ethers";

import Spinner from "./components/Spinner";
import SourceCode from "./components/SourceCode";

import metamaskLogo from "./assets/metamask-logo.svg";
import logo from "./assets/logo.svg";
import KMLogo from "./assets/key-manager-icon.svg";
import walletconnectIcon from "./assets/wallet-connect-icon.svg";

import "./App.css";
import "./Login.css";
import { safeAppSdk } from "./gnosis.safe.service";

const { chainRpcUrl, chainId, cacheServerUrl } = config;

setCacheConfig(chainId, { url: cacheServerUrl });
setChainConfig(chainId, { rpcUrl: chainRpcUrl });

type Role = {
	name: string;
	namespace: string;
};

function App() {
	const myDid = 'did:ethr:volta:0xdc2dF0A289D610546a8cDb4d15fbE1831Aba822F';
	let signerService: SignerService;
	let claimsService: ClaimsService;
	//console.log("localStorage: " + JSON.stringify(localStorage));
	const userRoles = localStorage.getItem("roles");
	const userDID = localStorage.getItem("did") || "";
	const roles = userRoles ? (JSON.parse(userRoles) as Role[]) : [];
	const [did, setDID] = useState<string>(userDID);
	const [errored, setErrored] = useState<Boolean>(false);
	const [loading, setLoading] = useState<Boolean>(false);
	const [unauthorized, setUnauthorized] = useState<Boolean>(false);
	let ididdocument: IDIDDocument;
	let didRegistry: DidRegistry;
	let claims = userRoles ? (JSON.parse(userRoles) as ClaimData[]) : [];
	let navigate = useNavigate();

	(async () => {
		const provider = new providers.JsonRpcProvider(
			"https://volta-rpc.energyweb.org"
		);
		//console.log("Provider: " + JSON.stringify(provider));
		//const accounts = await provider.listAccounts();
		//\console.log("Accounts: " + accounts);
		const reader = new DomainReader({
			ensRegistryAddress: VOLTA_ENS_REGISTRY_ADDRESS,
			provider,
		});
		//console.log("reader: " + JSON.stringify(reader));
		/*const roleDefinition = await reader.read({
			node: utils.namehash("consumer.roles.tesi.iam.ewc"), //Da qui ottengo informazioni sull' issuer
		});
		console.log("Role definition: " + JSON.stringify(roleDefinition));*/
		/*const isValidName = utils.isValidName("producer.roles.tesi.iam.ewc");
		console.log("Is valid name: " + isValidName);*/
		/*DA ERRORE
		const getAddress = await reader.read({
			node: utils.getAddress("0xde3d6dec263ce538670fba4c8725bf43279bbd06edb96cc6d3d3b8afe5defc2e"),
		});
		console.log("Get address: " + getAddress);*/
		/*const address = await provider.getNetwork();
		console.log("Address: " + JSON.stringify(address));*/

	})();

	useEffect(() => {
		const loginStatus = async () => {
			try {
				const res = await axios.get(`${config.backendUrl}/login-status`, {
					withCredentials: true,
				});
				const { loginStatus } = res.data;
				if (!loginStatus) {
					console.log("loginStatus: " + loginStatus)
					logout();
				}
			} catch (err) {
				let httpErr = err as { response?: { status: number } };
				if (httpErr?.response?.status === 401) {
					logout();
				}
			}
		};

		//loginStatus();
	});

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

	const login = async function({
		providerType,
	}: {
		providerType: ProviderType;
	}) {
		setLoading(true);
		setErrored(false);
		setUnauthorized(false);
		try {
			const initSignerObject = await initSignerService(providerType);			
			//const { signerService, messagingService, connectToCacheServer } = await initSignerService(providerType);
			setDID(initSignerObject.signerService.did);
			localStorage.setItem("did", initSignerObject.signerService.did);
			const {
				//domainsService,
				//stakingPoolService,
				assetsService,
				connectToDidRegistry,
				//cacheClient,
			} = await initSignerObject.connectToCacheServer();
			const { /*didRegistry,*/ claimsService } = await connectToDidRegistry();
			console.log("Did: " + initSignerObject.signerService.did);
			claims = await claimsService.getUserClaims({
				did: initSignerObject.signerService.did,
			});
			localStorage.setItem("roles", JSON.stringify(claims));
			console.log("Claims length: " + claims.length);
			localStorage.setItem("signerService", JSON.stringify(initSignerObject.signerService, getCircularReplacer()));
			localStorage.setItem("messagingService", JSON.stringify(initSignerObject.messagingService, getCircularReplacer()));
			localStorage.setItem("assetsService", JSON.stringify(assetsService, getCircularReplacer()));
			/*const documents = await didRegistry.getDidDocument({
				did: myDid,
			});
			console.log("Documents: " + JSON.stringify(documents));*/
			//console.log("LOGGING IN ", signerService.did);
			//console.log("signerService: " + JSON.stringify(signerService));


			claims.map(({ claimType }) => {
				if (claimType === "consumer.roles.tesi.iam.ewc") {
					navigate("/marketplace-consumer", { state: { account: did } })
				}
				if (claimType === "producer.roles.tesi.iam.ewc")
					navigate('/marketplace-owner');
				if (claimType === "aggregator.roles.tesi.iam.ewc")
					navigate('/marketplace-aggregator', { state: { account: did } });
			})
			let {
				identityToken,
			} = await signerService.publicKeyAndIdentityToken();
			/*if (identityToken) {
				await axios.post<{ token: string }>(
					`${config.backendUrl}/login`,
					{
						identityToken,
					},
					{ withCredentials: true }
				);
			}*/

			/*const { data: roles } = await axios.get<Role[]>(
				`${config.backendUrl}/roles`,
				{ withCredentials: true }
			);			
			console.log("Role: " + JSON.stringify(roles));*/
			//localStorage.setItem("roles", JSON.stringify(roles));
		} catch (err) {
			let httpErr = err as { response?: { status: number } };
			if (httpErr?.response?.status === 401) {
				setUnauthorized(true);
			}
			setErrored(true);
		}
		setLoading(false);
	};

	const getCircularReplacer = () => {
		const seen = new WeakSet();
		return (key, value) => {
			if (typeof value === "object" && value !== null) {
				if (seen.has(value)) {
					return;
				}
				seen.add(value);
			}
			return value;
		};
	};

	const logout = async function() {
		console.log("LOGGING OUT");
		signerService && (await signerService.closeConnection());
		setDID("");
		localStorage.clear();
	};

	const enrol = async function() {
		const { signerService, messagingService, connectToCacheServer } = await initSignerService(ProviderType.MetaMask);
		const {
			domainsService,
			stakingPoolService,
			assetsService,
			connectToDidRegistry,
			cacheClient,
		} = await connectToCacheServer();
		const { didRegistry, claimsService } = await connectToDidRegistry();
		await claimsService.createClaimRequest({
			issuer: myDid,
			claim: createClaim(),
			subject: "consumer",
			registrationTypes: ["RegistrationTypes::OffChain"],
		} as any);
	};

	const createClaim = function() {
		return {
			fields: [],
			claimType: "consumer.roles.tesi.iam.ewc",
			claimTypeVersion: 1
		}
	}

	const isProducer = function() {
		for (let i = 0; i < claims.length; i++) {
			if (claims[i].claimType == "producer.roles.tesi.iam.ewc")
				return true;
		}
		return false;
	}

	const isConsumer = function() {
		for (let i = 0; i < claims.length; i++) {
			if (claims[i].claimType == "consumer.roles.tesi.iam.ewc")
				return true;
		}
		return false;
	}

	const loadingMessage = (
		<div>
			<Spinner />
			<span>Loading... (Please sign messages using your connected wallet)</span>
		</div>
	);

	const enrolmentButton = config.enrolmentUrl && (
		<a
			href={`${config.enrolmentUrl}&returnUrl=${encodeURIComponent(
				window.location.href
			)}`}
			className="button"
		>
			<span>Enrol to test role</span>
		</a>
	);

	const loginResults = (
		<div>
			<p>Hello user!</p>
			<p>
				Your decentralised identifier: <br />
				<strong>{did}</strong>
			</p>
			{claims && claims.length > 0 ? (
				<div className="rolesContainer">
					<p>These are your validated roles:</p>
					{claims.map(({ claimType }) => (
						<p>
							<strong>{claimType}</strong>
						</p>
					))}
				</div>
			) : (
					<div>
						You do not have any issued role at the moment, please login into
						switchboard and search for apps, orgs to enrol.
					</div>
				)}
			<div className="logoutContainer">
				{enrolmentButton}
				<button onClick={logout} className="button">
					<span>Logout</span>
				</button>
			</div>
			<div className="logoutContainer">
				{enrolmentButton}
				<button onClick={enrol} className="button">
					<span>Enrol</span>
				</button>
			</div>
			{isProducer() ? (
				<div className="logoutContainer">
					<Link to={{
						pathname: '/marketplace-owner'
					}}>Produttore</Link>
				</div>
			) : (
					<div></div>
				)}
			{isConsumer() ? (
				<div className="logoutContainer">
					<Link to={{
						pathname: '/marketplace-owner'
					}}>Consumer</Link>
				</div>
			) : (
					<div></div>
				)}
		</div>
	);

	const loginOptions = (
		<div className="container">
			<button
				className="button"
				onClick={async () =>
					await login({ providerType: ProviderType.WalletConnect })
				}
			>
				<img
					alt="walletconnect logo"
					className="walletconnect"
					src={walletconnectIcon}
				/>
				<span>Login with Wallet Connect</span>
			</button>
			<button
				className="button"
				onClick={async () =>
					await login({ providerType: ProviderType.MetaMask })
				}
			>
				<img alt="metamask logo" className="metamask" src={metamaskLogo} />
				<span>Login with Metamask</span>
			</button>
			<button
				className="button"
				onClick={async () =>
					await login({ providerType: ProviderType.EwKeyManager })
				}
			>
				<img alt="metamask logo" className="metamask" src={KMLogo} />
				<span>Login with EW Key Manager</span>
			</button>
		</div>
	);

	const errorMessage = (
		<div>
			<p>
				Error occurred with login.
        <br />
        If you rejected the signing requests, please try again and accept.
        <br />
        If this is your first time logging in, your account needs a small amount
        of Volta token to create a DID Document.
        <br />A Volta token can be obtained from the{" "}
				<a href="https://voltafaucet.energyweb.org/">Volta Faucet</a>.
      </p>
			{loginOptions}
		</div>
	);

	const unauthorizedMessage = (
		<div>
			<p>
				Unauthorized login response.
        <br />
        Please ensure that you have the necessary role claim.
      </p>
			<div className="enrolbuttonContainer">
				{config.enrolmentUrl && (
					<p>Use enrolment button to request necessary role.</p>
				)}
				{enrolmentButton}
			</div>
			{loginOptions}
		</div>
	);

	const loginJsx = () => {
		if (loading) {
			return loadingMessage;
		}
		if (unauthorized) {
			return unauthorizedMessage;
		}
		if (errored) {
			return errorMessage;
		}
		if (did) {
			return loginResults;
		}
		return loginOptions;
	};

	return (
		<div className="App">
			<img src={logo} className="App-logo" alt="logo" />
			<h2>IAM showcase app</h2>
			{loginJsx()}
			<SourceCode />
		</div>
	);
}

export default App;

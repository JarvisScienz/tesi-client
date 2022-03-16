import React from 'react';
import { render } from 'react-dom';
import {
	BrowserRouter,
	Routes,
	Route,
} from "react-router-dom";

import {
	SignerService
} from "iam-client-lib";

import './index.css';
import App from './App';
import MarketplaceOwner from './components/Producer/MarketplaceOwner'
import MarketplaceConsumer from './components/Consumer/MarketplaceConsumer'
import MarketplaceAggregator from './components/Aggregator/MarketplaceAggregator'

const rootElement = document.getElementById("root");
render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="marketplace-owner" element={<MarketplaceOwner />} />
			<Route path="marketplace-consumer" element={<MarketplaceConsumer />} />
			<Route path="marketplace-aggregator" element={<MarketplaceAggregator />}  />
		</Routes>
	</BrowserRouter>,
	rootElement
);
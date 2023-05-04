const config = require('./config.js');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const path = require('path');
const { expect } = require('chai');
const logger = require('./index.js');
const { setTimeout } = require('timers/promises');
const { exit } = require('process');

// List of links to websites
let allSites = [
'https://www.nike.com/ca/t/air-jordan-1-mid-shoes-f8W9ns/DQ8426-301',
'https://www.petsmart.ca/featured-shops/month-long-deals-with-treats-membership/cat/disney100-minnie-mouse-kicker-cat-toy---catnip-crinkle-76516.html?cgid=600023802&fmethod=Browse',
'https://www.amazon.ca/Skybound-Eastward-Nintendo-Switch/dp/B09WT9WRK9/?_encoding=UTF8&pd_rd_w=2oA3q&content-id=amzn1.sym.b9873fe8-47b6-47db-9ce9-67f391a35b01&pf_rd_p=b9873fe8-47b6-47db-9ce9-67f391a35b01&pf_rd_r=WJKVC9R05RJRR2R7JW5Z&pd_rd_wg=Ovnmd&pd_rd_r=799cf6d9-a1e8-4b82-b2fe-098d8bef43d2&ref_=pd_gw_ci_mcx_mr_hp_atf_m',
'https://www.wayfair.ca/dining/pdp/house-of-hampton-crystalhouz-lead-free-crystal-whiskey-glass-tumbler-set-of-4-11-oz-diamond-dof-85cm-diameter-x-96cm-h-c005629470.html', 
'https://www.bestbuy.ca/en-ca/product/dji-mavic-3-pro-drone-remote-control-with-built-in-screen-dji-rc-grey/17064606', 
'https://www.homedepot.ca/product/ridgid-18v-lithium-ion-2-0-ah-battery-starter-kit/1001596487',
'https://www.lowes.ca/product/top-load-washers/lg-top-load-58-cuft-capacity-white-washer-with-direct-drive-motor-2514208', 
'https://www.kroger.com/p/kroger-2-reduced-fat-milk/0001111041700?fulfillment=PICKUP',
'https://www.walgreens.com/store/c/covergirl-get-in-line-active-liquid-liner/ID=prod6393918-product', 
'https://www.apple.com/ca/shop/buy-mac/macbook-air/m1-chip',
'https://www.acehardware.com/departments/paint-and-supplies/specialty-paints/chalk-paint/1413178?code=1000', 
'https://www.macys.com/shop/product/style-co-womens-mixed-media-lace-trimmed-top-created-for-macys?ID=15325071&CategoryID=10066&cm_sp=c2_1111INT_browse_women-sale-%26-clearance-_-row3-_-product-pool_buy-more%2C-save-more&rbe=rbe_carousel_thumb&swatchColor=Tropical%20Punch%20Red',
'https://www.gapcanada.ca/browse/product.do?pid=540877003&cid=63896&pcid=63896&vid=1&cpos=0&cexp=318&kcid=CategoryIDs%3D63896&cvar=1906&ctype=Listing&cpid=res23050210909523419993707#pdp-page-content',
'https://www.nordstrom.com/s/active-jacket/7170286?origin=category-personalizedsort&breadcrumb=Home%2FActivewear%2FMen%27s%20Activewear%2FJackets&color=301',
'https://www.autozone.com/greases-and-gear-oil/brake-lube/p/ags-sil-glyde-brake-lubricant-0-14oz/193245_0_0?rrec=true',
'https://www.basspro.com/shop/en/redhead-the-classic-polo-short-sleeve-shirt-for-men',
'https://www.urbanoutfitters.com/en-ca/shop/stanley-quencher-20-flowstate-40-oz-tumbler?color=001&recommendation=home-pwa-hp-tray-2-sfrectray-nonconsenttrendingmostviewed&type=REGULAR&size=ONE%20SIZE&quantity=1',
'https://rh.com/ca/en/catalog/product/product.jsp?productId=prod29480135&sale=false&layout=square',
'https://www.ae.com/ca/en/p/men/graphic-tees/branded/ae-super-soft-dip-dye-logo-graphic-t-shirt/0181_2866_400?menu=cat4840004',
'https://www.thebay.com/product/pieces-nya-puff-sleeve-tiered-dress-93136761.html?queryID=153a4b31d7f2198d646d8d64cc1e5d03&objectID=93136761',
'https://canada.michaels.com/en/11.5in-led-flamingo-tabletop-light-by-ashland/10710881.html',
'https://www.officedepot.com/a/products/348037/Office-Depot-Brand-Multi-Use-Print/?promo_name=homepage&promo_id=wk18_c&promo_creative=td&promo_position=348037-odpaper',
'https://www.ikea.com/ca/en/p/uppland-sofa-blekinge-white-s39384115/',
'https://www.dillards.com/p/prada-womens-53mm-butterfly-sunglasses/516382865',
'https://www.staples.ca/products/737039-en-crayola-construction-paper-10-colours-120-sheets',
'https://www.academy.com/p/agame-classic-bean-bag-toss-game',
'https://www.bathandbodyworks.com/p/gingham-gorgeous-fine-fragrance-mist-026621746.html?cgid=body-care#start=1',
'https://www.williams-sonoma.ca/products/eclectique-mugs/?pkey=ctabletop-coffee-mugs-teacups',
'https://www.ulta.com/p/bond-building-repair-oil-serum-pimprod2037670?sku=2604044',
'https://www.chewy.com/iams-proactive-health-minichunks/dp/805742',
'https://www.jcpenney.com/p/ana-womens-liah-wedge-sandals/ppr5008265474?pTmplType=regular&deptId=dept20000018&urlState=%2Fg%2Fshoes%3Fboostids%3Dppr5008265474-ppr5008267680%26s1_deals_and_promotions%3DSALE%26id%3Ddept20000018&productGridView=medium&badge=onlyatjcp&cm_re=ZB-_-HOME-_-IM-_-FRIENDS-FAMILY-_-SHOES',
'https://www.walmart.ca/en/ip/2022-panini-nfl-prizm-football-trading-card-blaster-box-multicolor/6000206378671?rrid=richrelevance',
'https://www.sportchek.ca/categories/men/jackets-coats-vests/winter-jackets/down-insulated-jackets/product/mountain-hardwear-mens-weather-down-parka-color-333835569_24-333835569.html#333835569%5Bcolor%5D=333835569_24',
'https://www.atmosphere.ca/en/pdp/ray-ban-men-s-women-s-clubmaster-browline-sunglasses-polarized-29205675f.html',
'https://www.adidas.ca/en/into-the-metaverse-superstar-shoes/IE1841.html?cm_sp=SLOT-3.1-_-HOME_%3F_%3F_HOME_EDUCATE-HUB-MW-PRODUCT-SELECTION-CAROUSEL-SS23-_-PRODUCTSELECTIONCAROUSEL-PRODUCT-CARD-_-1002597',
'https://www.sportinglife.ca/en-CA/kids/boys/coats-jackets/junior-boys-7-20-warm-storm-rain-jacket-25708421.html?dwvar_25708421_color=530&dwvar_25708421_size=002&cgid=#shop-all-products=&prefn1=coatStyle&prefv1=Raincoat&start=1',
'https://www.thebrick.com/products/plum-dining-table',
'https://www.gamestop.ca/Switch/Games/904634/the-legend-of-zelda-tears-of-the-kingdom',
'https://www.homedepot.ca/product/stylewell-reversible-outdoor-8-ft-x-12-ft-area-rug-blue-stripe/1001726818?rrec=true',
'https://www2.hm.com/en_ca/productpage.1013317002.html',
'https://www.bjs.com/product/betty-crocker-bisquick-baking-and-pancake-mix-96-oz/3000000000001546305',
'https://www.dollarama.com/en-CA/p-lysol-disinfectant-spray-crisplinen/3041909',
'https://www.loblaws.ca/nutrition-first-dog-food-chicken-brown-rice-pea/p/21304726_EA',
'https://www.roots.com/ca/en/re-issue-91-earth-crew-sweatshirt-gender-free-27040054.html?dwvar_27040054_color=H27',
'https://urban-planet.com/collections/up_mens-bottoms_shorts/products/0634-56187820-festival-print-chino-short?variant=41021954228317',
'https://blnts.com/collections/bn_shop-all-hoodies-joggers/products/0636-39662303-cargo-fleece-short',
'https://shop.hallmark.ca/products/pop-up-mothers-day-card-with-light-and-sound-for-mom-displayable-pot-of-flowers-plays-happy-by-pharrell-williams',
'https://www.spencersonline.com/product/glowing-green-vs-blue-beer-pong-table-8-ft-/223680.uts',
'https://west49.com/products/1650-31397020-zoo-york-mens-sushi-animal-tshirt',
'https://bananarepublic.gapcanada.ca/browse/product.do?pid=519451033&cid=1189598&pcid=75310&vid=1&nav=meganav%3AMen%3AMen%27s%20Clothing%3ASuits#pdp-page-content',
'https://www.hottopic.com/product/led-zeppelin-zoso-logo-tie-dye-t-shirt/16340644.html',
'https://www.samsung.com/ca/refrigerators/french-door/rf5000a-18-cu-ft-black-rf18a5101sg-aa/',
'https://www.softmoc.com/ca/i/sperry-lds-crest-vibe-shimmer-sneaker-fade-mlt/sts88482',
'https://www.levi.com/CA/en_CA/clothing/men/jeans/straight/501-93-straight-fit-mens-jeans/p/798300241',
'https://oldnavy.gapcanada.ca/browse/product.do?pid=544320043&rrec=true&mlink=5001,1,home_onhome1_rr_0&clink=1#pdp-page-content',
'https://boathousestores.com/collections/mens-sneakers/products/mens-vans-sk8-hi-reconstruct-3',
'https://www.geox.com/en-CA/lightweight_jacket-light_grey-black-vincit_man-M3522FT2993F1513.html',
'https://www.sephora.com/ca/en/product/sol-de-janeiro-beija-flor-body-hair-mist-P483156?icid2=homepage_productlist_chosenforyou_ca_rwd_092022',
'https://www.abercrombie.com/shop/ca/p/pattern-3-button-sweater-polo-51793819?categoryId=12202&faceout=model&seq=01',
'https://www.reitmans.com/en/short-sleeve-midi-dress-with-wrap-detail/467359.html?dwvar_467359_color=Rosin&cgid=New%20Arrivals#start=1',
'https://www.peoplesjewellers.com/625mm-white-labcreated-sapphire-drop-earrings-sterling-silver/p/V-20563908',
'https://www.davidstea.com/ca_en/tea/tea-by-flavour/mint/organic-mint-everest-tea/11018DT01VAR0101222.html?cgid=mint-flavors#start=1',
'https://shop.shoppersdrugmart.ca/airpods-pro-2nd-generation/p/BB_194253397168?variantCode=194253397168',
'https://www.stokesstores.com/en/remy-olivier-reims-round-frying-pan.html',
'https://www.sunglasshut.com/ca-en/versace/ve4361-8056597094504',
'https://www.garageclothing.com/ca/p/wide-leg-jean/10008361907I.html',
'https://www.freepeople.com/shop/essential-slim-midi/?source=PRODUCTIDPRODUCTTRAY&color=030&type=REGULAR&quantity=1',
'https://www.aldoshoes.com/ca/en/women/rheanastraw-pink/p/13428507',
'https://www.harryrosen.com/en/product/patrick-assaraf-pocket-stretch-cotton-t-shirt-20084589070',
'https://shophoney.com/collections/casual-dresses/products/ld50338'

];

// 'https://www.footlocker.ca/en/product/adidas-reptossage-mens/46427400.html',
// 'https://www.canadagoose.com/ca/en/kelowna%C2%A0fleece%C2%A0jacket-humanature-7017M2.html',
// Canada goose and footlocker have blocker
//allSites = ['https://www.footlocker.ca/en/product/jordan-retro-13-mens/24181998.html'];
let failSites = 'Extension did not load on the following sites:\n';
let passReload = 'Extension loaded after reloading page\n';
var options = {
	"level": logger.LEVELS.ERROR,
	"tags": "extensionTest"
};
const pathName = path.join(process.cwd(),'dist/orm-extension-app');
(async () => {
	await config.init();
	await logger.init('extension-test', 'local');
	const browser = await puppeteer.launch({
		headless: "new",
		args: [
			// replace with extension path
			`--disable-extensions-except=${pathName}`,
			`--load-extension=${pathName}`,
		  ],});
	var attempts = 0;
	var i = 0;
	while (i < allSites.length) {
		
		try {
			// Create new tab
			var page = await browser.newPage();
			// Go to webpage
			await page.goto(allSites[i]);
			// Check if orm extension button exists and appears
			var button =  await page.waitForSelector('orm-extension >>> button');
			expect(await button.isVisible() == true);
			//await setTimeout(2000);
			await page.close();
			// Document if button appeared after reloading page
			if (attempts > 0) {
				passReload += allSites[i].split('/')[2];
				passReload += '\n';
			}
			attempts = 0;
			i++;
			
		} catch {
			
			// If button does not appear after page reloads 3 times
			// log failure
			if (attempts >= 3) {
				var x = allSites[i].split('/');
				failSites += x[2];
				failSites += '\n';
				i++;
				attempts = 0;
				await page.close();
			} else {
				attempts++;
				await page.close();
			}
			
		}
	}
	
	// Log results to logz.io
	if (failSites.localeCompare('Extension did not load on the following sites:\n') !== 0) {
		if (passReload.localeCompare('Extension loaded after reloading page\n') !== 0) {
			failSites += '\n';
			failSites += passReload;
		}
		//console.log(failSites);
		logger.log(failSites, options);
	} else {
		options.level = logger.LEVELS.VERBOSE;
		if (passReload.localeCompare('Extension loaded after reloading page\n') !== 0) {
			//console.log(passReload);
			passReload += 'Extension loaded first try on all other sites';
			logger.log(passReload,options);
		}
		else {
			//console.log("All Options Passed")
			
			logger.log("All sites passed", options);
		}
		
		
	}
	await browser.close();
	await setTimeout(30000);
	await exit(0);
})();

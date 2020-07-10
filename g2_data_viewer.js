// This file was created as part of my #Mozcon 2020 presentation; it's an example of how to use a particular technique.
// It's not an official Moz product, and isn't supported
// In this example, we crawl a content site (G2.com) to visualize their data in a different way

// For more information (and the presentation slides) visit: *** ousbey.com/mozcon ***

// Also: I'm not a great coder. This code is designed to be fast to create and does a particular job.
// You can see my tips on being a JavaScript hacker right over here: https://twitter.com/RobOusbey/status/1278406332882673664

// If you want to reach out via Twitter, I'll try to help: @RobOusbey



// jQuery is already in use on G2, so that makes things easier
// We start by replacing the code of the page with a text area, a button and a table.
// I also included the framework from https://purecss.io/ to makes things look just a little better
$("html").html(`
	<html>
		<head>
			
			<link rel="stylesheet" href="https://unpkg.com/purecss@2.0.3/build/pure-min.css" integrity="sha384-cg6SkqEOCV1NbJoCu11+bm0NvBRc8IYLRGXkmNrqUBfTjmMYwNKPWBTIKyw9mHNJ" crossorigin="anonymous">
		</head>
		<body>
			<div class="pure-g">
				<div class="pure-u-1-24"></div>
				<div class="pure-u-1-2">
					<h1>G2 Scraper</h1>
					
					<div><textarea style="height: 200px; width: 400px;" id="input" placeholder="Enter product names, each on a new line" spellcheck="false"></textarea></div>
					<div><button id="start" class="pure-button pure-button-primary">Go</button></div>
					<div style="margin-top: 20px;"><table id="output" class="pure-table pure-table-horizontal">
						<thead><tr>
							<th>Product</th>
							<th>Reviews</th>
							<th>Score</th>
							<th>Ease of Use</th>
							<th>Support</th>
							<th>Ease of Setup</th>
						</tr></thead>
						<tbody></tbody>
					</table></div>
				
				</div>
				<div class="pure-u-1-4"></div>
			</div>
		
		
		</body>
	</html>`);


// This code assigns a function to run when the 'start' button is clicked
$("#start").click(function() {
	
	//This grabs the input from the textarea, and splits it into an array
	productList = $("#input").val().split(/\r?\n/);
	
	// This loops over that array, and adds a row to the table for each product name
	$.each( productList, function( i, inputName ){
		inputName = inputName.trim().toLowerCase();
	  	$("#output").append('<tr class="product" data-name="'+inputName+'" data-processed="false"><td class="name">'+inputName+'</td><td class="count"></td><td class="rating"></td><td class="rating_use"></td><td class="rating_support"></td><td class="rating_setup"></td></tr>');

	});
	
	// Empties the textarea
	$("#input").val('');

	// This now loops over the rows of table, and passes each row to another function for crawling
	$("#output tr.product").each(function( index ) {
		crawlSearchResults($(this));
	});
	
	
});



// This function takes a row from the table as a parameter
function crawlSearchResults(productRow){
	
	// It grabs the name of the product from the text of a cell in the row
	searchQuery = productRow.data("name");
	
	// This is jQuery's asynchronous "GET" function, that requests a page from elsewhere
	$.get( "/search/products?max=10&query="+ searchQuery, function( data ) {
			var $page = $(data);
			
			// This just creates an object where we can store the data we find on the page 
			productData = {};
			// We use .product-listing:first to grab the first listing on the results page
			productData.url = $page.find(".product-listing:first .product-listing__title a").attr("href");
			productData.name = $page.find(".product-listing:first .product-listing__product-name").text();
			productData.count = $page.find(".product-listing:first .product-listing__info a.link .px-4th").text().replace(/[^0-9.]+/g,"");
			productData.rating = $page.find(".product-listing:first .product-listing__info a.link .fw-semibold").first().text().trim();
						
			
			// We write the data we have so far into the table
			productRow.find(".name").html('<a href="'+productData.url+'">'+productData.name+'</a>')
			productRow.find(".count").html(productData.count)
			productRow.find(".rating").html(productData.rating)
			
			
			// Now we make another GET request, to the actual page for each product 
			$.get(productData.url, function( productPageData ) {
				
				
				var $productPage = $(productPageData);
				
				// Here's another object to store the data we scrape from this page
				ratingDetails = {};
			
				// There's no structured markup on the part of the page that we want to get data from, so we use the :contains() pseudoselector to find the data we need
				// .closest is a jQuery function move up the DOM tree; .find moves down it, until we've gotten to the element that we want to take the data from
				ratingDetails.use = $productPage.find('.cell.small-7 div:contains("Ease of Use")').closest('.grid-x').find('.charts--doughnut__reviews').text();
				ratingDetails.support = $productPage.find('.cell.small-7 div:contains("Quality of Support")').closest('.grid-x').find('.charts--doughnut__reviews').text();
				ratingDetails.setup = $productPage.find('.cell.small-7 div:contains("Ease of Setup")').closest('.grid-x').find('.charts--doughnut__reviews').text();
				
				// This writes everything back into the table
				productRow.find(".rating_use").html(ratingDetails.use)
				productRow.find(".rating_support").html(ratingDetails.support)
				productRow.find(".rating_setup").html(ratingDetails.setup)

				
			});
			
			
			
		});
	
	
}



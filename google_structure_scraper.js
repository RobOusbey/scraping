// This file was created as part of my #Mozcon 2020 presentation; it's an example of how to use a particular technique.
// It's not an official Moz product, and isn't supported
// This file works if jQuery is already injected into Google, via the bookmarklet at the link above.

// For more information (and the presentation slides) visit: *** ousbey.com/mozcon ***

// Also: I'm not a great coder. This code is designed to be fast to create and does a particular job.
// You can see my tips on being a JavaScript hacker right over here: https://twitter.com/RobOusbey/status/1278406332882673664

// If you want to reach out via Twitter, I'll try to help: @RobOusbey




// The first step is replace the entire HTML of the page with a form and an empty table that we can write the output to.
$("html").html(`
	<html>
		<head>
			<link rel="stylesheet" href="https://unpkg.com/purecss@2.0.3/build/pure-min.css" integrity="sha384-cg6SkqEOCV1NbJoCu11+bm0NvBRc8IYLRGXkmNrqUBfTjmMYwNKPWBTIKyw9mHNJ" crossorigin="anonymous">
		</head>
		<body>
			<div class="pure-g">
				<div class="pure-u-1-4"></div>
				<div class="pure-u-1-2">
					<h1>Google Site Structure Scraper</h1>
					
					<div>
						<form class="pure-form">
							<fieldset class="pure-group">
								<input id="input" type="text" class="pure-input-1-2" placeholder="www.example.com" />
							</fieldset>
							<button id="collect_serps" type="submit" class="pure-button pure-input-1-2 pure-button-primary">Crawl Site</button>
						</form>
					
					</div>
					<div id="error" style="display: none; background: #f5ab9e; border: 1px solid #8c3a2b; padding: 20px; margin: 20px 0;"></div>
					<div style="margin-top: 20px;"><table id="output" class="pure-table pure-table-horizontal">
						<thead><tr>
							<th>Folder</th>
							<th>Indexed Pages</th>
						</tr></thead>
						<tbody></tbody>
					</table></div>
				
				</div>
				<div class="pure-u-1-4"></div>
			</div>
		
		
		</body>
	</html>`);


// Here's we're setting up some variables - the domain we're investigating, an array of paths we already know about, and a delay to avoid hitting Google too hard
var domain;
var discoveredPaths = [];
var crawlDelay = 1000; // timing in milliseconds


// This uses jQuery to assign a function to run when the #collect_serps button is clicked
$("#collect_serps").click(function(event){
	event.preventDefault();
	$('#error').hide();
	collectSERPs();
});


// This is the function that runs when the button is pressed
function collectSERPs(){
	
	// The domain is set, based on the value of the textbox
	domain = $("#input").val();
	
	// The query is created, starting with the domain name, and then excluding all the folders we already know about.
	// For example, a query here might be:
	// site:moz.com -site:moz.com/blog -site:moz.com/learn
	query = 'site:' + domain;
	discoveredPaths.forEach(function (item) {
	  query += ' -site:' + domain + '/' + item;
	});
	
	// This uses jQuery's GET function to fetch the page we require
	// Because we're on Google, and passing a relative URL, it will find it on the Google domain that you're running it on
	$.get( '/search?q='+ encodeURIComponent(query), function( data ) {
		var $page = $(data);
		
		// This is a really blunt bit of parsing on the page! We're using CSS selectors to find any links on the page to our target domain name
		// This means that we don't have to worry about changes to the structure of Google's page, we just look for any links to our domain
		// Once found, we're using the jQuery 'each' function to look over them.
		$page.find('#search a[href^="http://'+domain+'"], #search a[href^="https://'+domain+'"]').each(function(index){
			
			// We use $(this) to refer to the current item from the array
			// We get the URL of each link, and then split out the first folder (the 'slug')
			url = $(this).attr("href") + '/';
			slug = url.split("://")[1].split("/")[1].toLowerCase();
			
			// We check to see if this slug is already in our list (and make sure it's not empty, ie: the homepage)
			if (slug !== '' && discoveredPaths.indexOf(slug) == -1){
				
				// if this is newly discovered then we add a row to the table using .append() and then we add it into the array (with .push)
				$("#output").append('<tr class="folder" data-name="'+slug+'" data-processed="false"><td class="slug">'+slug+'</td><td class="count"></td></tr>');				
				discoveredPaths.push(slug);
			}
			
			
		});

		// After that search has been done, then we kick off the function to count the number of indexed pages in each folder
		// It's important that this instruction sits inside the .get() function code, so that it doesn't run until after the code above is complete
		// This is because jQuery's ajax functions (.get, .post, .ajax) really are asynchronous, and code outside of here may execute before this part is complete.
		getAllCounts();
		
	// This is just to catch any situation where the get request fails
	}).fail(function(data) {
		respondToCrawlError();
	});	
}


function getAllCounts(){
	
	// Resetting a variable
	scheduledTimeFromNow = 0;
	
	// Looping over every row in the table that is still tagged as "data-processed=false"
	$('#output tr[data-processed="false"]').each(function(index){
		
		// It sets the output cell to say pending
		$(this).find('td.count').text('Pending...');
		
		// We then increment the 'schedule' variable, and pass the row name and the delay to another function
		scheduledTimeFromNow += crawlDelay;
		getFolderCountWithDelay($(this).attr('data-name'), scheduledTimeFromNow);
	});
	
}

function getFolderCountWithDelay(slug, delay){
	
	// This function just uses JavaScript's setTimeout function to schedule a function to run after a certain amount of time
	
	console.log("Setting " + delay + "ms delay for: " + slug );
	
	setTimeout(function(){ getFolderCount(slug);},delay);
	
}



function getFolderCount(slug){
	
	// This is the function that actually does the hard work of counting the number of indexed pages for a particular folder.
	
	// We first update the row to show that we're fetching data for this particular folder
	$('#output tr[data-processed="false"][data-name="'+slug+'"] td.count').text("Fetching...");
	console.log("Fetching " + slug );
	
	// Then we run another get request, but this time for a query like:
	// site:moz.com/blog/
	$.get( "/search?q=site%3A"+ domain+"/"+slug+"/", function( data ) {
		var $page = $(data);
		
		
		// In the results page, we grab the text of the div where id="results-stats"
		// If it starts with 'About ' then we remove this text
		// Then we just grab all the text before the first space in the text, and call that our count.
		count = $page.find('#result-stats').text().replace('About ','').split(' ')[0]
		
		
		// We write the resulting number into the table using the .text() function, and update that row to show that it's been processed, so that it's not done again next time around
		$('#output tr[data-name="'+slug+'"] td.count').text(count);
		$('#output tr[data-name="'+slug+'"]').attr('data-processed', 'true');
		
	// Again, this is an error catcher in case the get request comes back with a non-200 status code	
	}).fail(function(data) {
		respondToCrawlError();
	});

}

// The most likely reason to get a non-200 code is that you've been crawling too much / too fast, and need to prove that you're a human.
// So, this just creates an error message to warn you that you need to take action.
// Fortunately, you're a human, not a bot, so you can just go solve the CAPTCHA!
function respondToCrawlError(){
	
	$('#error').html('It looks like Google might thing you\'re a bot. Click <a href="https://www.google.com/search?q=test" target="_blank">here</a> to pass a CAPTCHA, and then come back here to try again.');
	$('#error').show();
	
	
}
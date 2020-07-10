// This file was created as part of my #Mozcon 2020 presentation; it's an example of how to use a particular technique.
// It's not an official Moz product, and isn't supported

// For more information (and the presentation slides) visit: *** ousbey.com/mozcon ***

// Also: I'm not a great coder. This code is designed to be fast to create and does a particular job.
// You can see my tips on being a JavaScript hacker right over here: https://twitter.com/RobOusbey/status/1278406332882673664

// If you want to reach out via Twitter, I'll try to help: @RobOusbey


// We start by running a few checks, to make sure that the bookmarklet is being run on an appropriate page.
if (!window.location.href.match("/pro/analytics/analyze-keyword/")){
	
	// First we check that we're on the right kind of page
	alert('Open a Moz Pro Campaign, then navigate to "Analyze a Keyword" and select a keyword to begin using this tool');

} else if ($("table").length < 3){
	
	// Then we check that the table has loaded (this takes a few seconds usually)
	alert("Please wait until the SERP Analysis table has loaded and then try again");
	
} else if ($('body').hasClass('lighthouse-ready')){
	
	// Then we make sure that this hasn't already been run, so that things don't get doubled up.
	alert("You only need to run this once");
	
} else {
	// If none of the above are true, then everything can run as expected


	// We add a tag to the body, just so we know that this has run (for the check above), and add some CSS just to widen out the page
	$('body').addClass('lighthouse-ready');
	$('.container').attr('style', 'width: 1600px; max-width: 1600px !important');

	// We create an array of the items that we want to get out of the Lighthouse report
	lighthouseFeatures = [{id:'performance',title:'Performance'}, {id:'accessibility',title:'Accessibility'}, {id:'best-practices',title:'Best Practices'}, {id:'seo',title:'SEO'}]

	// This loops through the items in that array, and for each item it adds a table heading and a cell to every row 
	lighthouseFeatures.forEach(function (item) {
		$('table.table.table-basic thead tr').append('<th class="table-header" role="columnheader" scope="col" style="width: 110px;"><div class="table-header-container"><span class="table-header-name">'+item.title+'</span></div></th>');
		$('table.table.table-basic tbody tr').append('<td class="lighthouse '+item.id+'" colspan="1"></td>');
	});
	
	// In the 'performance' cell, we add a link to run the report for that row
	$('td.lighthouse.performance').html('<a class="run_lighthouse" href="#">Run Lighthouse</a>');


	// This defines the function to run for all of those links we just added.
	$('a.run_lighthouse').click(function(event) {
		
		// Since they're actual links, the 'preventDefault' function in JavaScript makes sure that clicking it doesn't do anything other than the code we've written here
		// IE: the browser won't try to navigate anywhere because of the user clicking on it
		event.preventDefault()
		
		// This finds the URL of the page in this row, and sets it as the targetUrl variable
		targetUrl = $(this).closest('tr').find('a.external-link').attr('href');
		console.log(targetUrl);
		
		// We set a data attribute on the row, so that we can find it again later to put the results in here
		$(this).closest('tr').attr('data-targeturl',targetUrl);
		// Then we add an animated gif to let the user know that something's working
		// This also has the benefit of removing the link, so that it can't accidentally be clicked on twice
		// I created this very 'slow' gif that takes about 20 seconds to run, which is about the time taken to load the Lighthouse report
		// The random number added to the end of the image URL is to force it to treat all the gifs separately, so that they're not all in sync.
		// (Try removing the cache-busting code, if you want to see the difference.)
		$(this).closest('td').html('<img src="https://i.imgur.com/IADMHuI.gif?cache='+Math.random()+'">')
		
		
		// We use jQuery's .ajax function here to do a cross-domain post request
		// This function requires us to specify more parameters, but gives us more control over things
		$.ajax({
			type: 'POST',
			url: 'https://lighthouse-dot-webdotdevsite.appspot.com//lh/newaudit?replace=true&save=false&url='+encodeURIComponent(targetUrl),
			crossDomain: true,
			success: function(responseData, textStatus, jqXHR) {
				
				// Here's the code that runs after we get back the JSON object from the Lighthouse app
				
				// We start by identifying which row the data should be posted back to
				requestedUrl = responseData.lhr.requestedUrl
				outputRow = $('tr[data-targeturl="'+requestedUrl+'"]');
				
				// Then it's as simple as looping over the array of features we set up earlier
				// For each one, we pull out a data point and write it to the table 
				lighthouseFeatures.forEach(function (item) {
					outputRow.find('.'+item.id).text(Math.round(100 * responseData.lhr.categories[item.id].score));
				});
				
				
			},
			error: function (responseData, textStatus, errorThrown) {
				alert('POST failed.');
			}
		});
		
		
	});


}
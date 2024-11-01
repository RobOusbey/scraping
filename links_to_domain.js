var activeDomain;

if (typeof myDomain !== "undefined") {
    activeDomain = myDomain;
} else {
    activeDomain = "underarmour.com";
}
// var brandRegex = new RegExp("underarmour|under.armour", "i");

var allLinks = [];
$("a").each(function() {

    allLinks.push(
        {
            text: $(this).text() || "-",
            href: $(this).attr("href") || "[no href]",
            rel: $(this).attr("rel") || "-"
        }
    );

});


$("html").html(`
	<html>
		<head>
			<link rel="stylesheet" href="https://unpkg.com/purecss@2.0.3/build/pure-min.css" integrity="sha384-cg6SkqEOCV1NbJoCu11+bm0NvBRc8IYLRGXkmNrqUBfTjmMYwNKPWBTIKyw9mHNJ" crossorigin="anonymous">
            <style>
                .domainlink {
                    background-color: #d9edf7;
                }
                #output img {
                    max-width: 100px;
                    max-height: 100px;
                }
            </style>
        </head>
		<body>
			<div class="pure-g">
				<div class="pure-u-1-4"></div>
				<div class="pure-u-1-2">
					<h1>Links to Your Site</h1>

                    
                    <form class="pure-form">
                        <input type="text" id="domain" value="${activeDomain}" />
                        <button id="search" class="pure-button">Search</button>
                    </form>

					
					<div style="margin-top: 20px;"><table id="output" class="pure-table pure-table-horizontal">
						<thead>
                            <tr>
                                <th>Link Text</th>
                                <th>Target URL</th>
                                <th>rel</th>
                        </thead>
						<tbody></tbody>
					</table></div>
				
				</div>
				<div class="pure-u-1-4"></div>
			</div>
		
		
		</body>
	</html>`);


addLinksToTable();

// form listener
$("#search").click(function(e) {
    e.preventDefault();
    activeDomain = $("#domain").val();
    $("#output tbody").html("");
    addLinksToTable();
});




function addLinksToTable(){

    // sort the 'all links' array by putting the ones that match the domain first

    allLinks.sort(function(a, b) {
        if (a.href.indexOf(activeDomain) > -1 && b.href.indexOf(activeDomain) === -1) {
            return -1;
        } else if (a.href.indexOf(activeDomain) === -1 && b.href.indexOf(activeDomain) > -1) {
            return 1;
        } else {
            return 0;
        }
    });

    // Now that we have the table, we can write the links to it.
    allLinks.forEach(function(link) {
        $("#output tbody").append(`
            <tr class="${link.href.indexOf(activeDomain) > -1 ? 'domainlink' : ''}">
                <td>${link.text}</td>
                <td>${link.href}</td>
                <td>${link.rel}</td>
            </tr>
        `);
    });

}


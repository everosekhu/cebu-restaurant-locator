 $(function () {
 	
 	// get data
 	var resto_data = [];
 	var temp_data = [];
    window.mock_data_callback = function(results) {
    	var mc_data = results.data;
 		for (var i = 0; i < mc_data.length; i++) {
 			temp_data.push(mc_data.name);
 			resto_data.push(temp_data);
 		}
 	}

 	// initialise data table
 	$('table#analytics_table').dataTable({
 		searching: false,
 		paging: false,
 		data: resto_data,
 		columns: [
 			{ title: "Name" },
 		]
 	});

 });
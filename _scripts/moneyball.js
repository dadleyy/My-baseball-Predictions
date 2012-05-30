/*

MONEYBALL.js

Written  by:    Danny Hadley
Produced by:    Involution Studios
With help from: D3.JS

*/

var rawdata     = [];
var datafile    = "_data/moneyball.csv";
var columnnames = [];
var teams       = [];
var teamnames   = [];
var relations   = [];
var cities      = [];
var divisions   = [];
var worldseries = [];
var wildcards   = [];
var max_timeout = 0;
var teamnames_sorted = Array();
var payroll_scale, winamt_scale;

d3.csv(datafile, function(d) {
		rawdata = d;	
		start();
});

window.onload = function(){
	
	$(".vischanger").each(function(){
		$(this).click(function(){
			var id = $(this).attr("id");
			if(id == "all"){
				$("#all").removeClass("all_off").addClass("all_on");
				$("#indi").removeClass("indi_on").addClass("indi_off");
				initBarChart("2012", "payroll");
			}else if(id == "indi"){
				$("#all").removeClass("all_on").addClass("all_off");
				$("#indi").removeClass("indi_off").addClass("indi_on");
				initbubble( teamnames[0] );
			}
		})
	});
	
	document.onselectstart = function() {return false;} 
	
};

function start(){
	
	columnnames = d3.keys(rawdata[0]);
	fillteams();
	
}

//populates the teams array with objects
//for each team, and with each team having
//objects for each year
function fillteams(){
	var index     = 0;
	var relindex  = 0;
	var cityindex = 0;
	var prevteam  = '';
	
	for(var i = 0; i < rawdata.length; i++)
	{
		//access the object from the data at the index 
		var currow  = rawdata[i];
		//get the long string of the name associated with that object
		var curname = currow['name']; 
		//get the relationship (the year ex: 2012 OR if it is the average ex: "AVG")
		var currel  = getrel(curname);
		//get the team that this row is associated with
		var curteam = getteam(curname);
		if(curteam == "RedSox" || curteam == "WhiteSox"){
			curteam = teamsnameswithspaces( curteam );
		}
		//get the city that this row is associated with
		var curcity = getcity(curname);		
		//skip anything that is not relevant
		if( (!currel) || (!curteam) ){
			continue;
		}
		
		//update the city array
		var newcity = true;
		for(var j = 0; j < cities.length; j++){
			var tcity = cities[j]["name"];
			if(curcity == tcity){
				newcity = false;
			}
		}
		if(newcity){
			cities[cityindex] = {"name":curcity,"teams":Array()};
			cityindex++;
		}
		
		//add this row's team name to the cities array
		for(var w = 0; w < cities.length; w++){
			var tcity = cities[w]["name"];
			if(curcity == tcity){
				cities[w]["teams"].push(curteam);
			}
		}
		
		//update the relationship array
		var newrel = true;
		//check to see if this relationship is new
		for(var j = 0; j < relations.length; j++){
			var trel = relations[j];
			if(currel == trel){
				newrel = false;
			}
		}
		if(newrel){
			relations[relindex] = currel;
			relindex++;
		}
		
		
		//check to see if we have a new team
		if( curteam != prevteam	){
			//set the past team to the current
			prevteam = curteam;
			//add the new team to the array of team names
			teamnames[index] = prevteam;
			//initialize a new array for the teams array
			teams[prevteam]  = Array();
			index++; 
		}
		teams[prevteam][currel] = currow;
	}
	
	var zNLEast = { "name":"National League East", "teams": Array(), "winners": Array() };
	zNLEast["teams"].push( "Phillies" );
	zNLEast["teams"].push( "Braves" );
	zNLEast["teams"].push( "Nationals" );
	zNLEast["teams"].push( "Marlins" );
	zNLEast["teams"].push( "Mets" );
	
	zNLEast["winners"].push( "Mets" );     //2006
	zNLEast["winners"].push( "Phillies" ); //2006
	zNLEast["winners"].push( "Phillies" ); //2008
	zNLEast["winners"].push( "Phillies" ); //2009
	zNLEast["winners"].push( "Phillies" ); //2010
	zNLEast["winners"].push( "Phillies" ); //2011
	divisions.push( zNLEast );
	
	var zNLCentral = { "name":"National League Central", "teams": Array(), "winners": Array() };
	zNLCentral["teams"].push( "Cubs" );
	zNLCentral["teams"].push( "Brewers" );
	zNLCentral["teams"].push( "Cardinals" );
	zNLCentral["teams"].push( "Astros" );
	zNLCentral["teams"].push( "Reds" );
	zNLCentral["teams"].push( "Pirates" );
	
	zNLCentral["winners"].push( "Cardinals" ); //2006
	zNLCentral["winners"].push( "Cubs" );      //2007
	zNLCentral["winners"].push( "Cubs" );      //2008
	zNLCentral["winners"].push( "Cardinals" ); //2009
	zNLCentral["winners"].push( "Reds" );      //2010
	zNLCentral["winners"].push( "Brewers" );   //2011
	divisions.push( zNLCentral );
	
	var zNLWest    = { "name":"National League West", "teams": Array(), "winners": Array() };
	zNLWest["teams"].push( "Diamondbacks" );
	zNLWest["teams"].push( "Rockies" );
	zNLWest["teams"].push( "Padres" );
	zNLWest["teams"].push( "Dodgers" );
	zNLWest["teams"].push( "Giants" );
	
	zNLWest["winners"].push( "Padres" );       //2006
	zNLWest["winners"].push( "Diamondbacks" ); //2007
	zNLWest["winners"].push( "Dodgers" );      //2008
	zNLWest["winners"].push( "Dodgers" );      //2009
	zNLWest["winners"].push( "Giants" );       //2010
	zNLWest["winners"].push( "Diamondbacks" ); //2011
	divisions.push( zNLWest );
	
	var zALEast    = { "name":"American League East", "teams": Array(), "winners": Array() };
	zALEast["teams"].push( "RedSox" );
	zALEast["teams"].push( "Yankees" );
	zALEast["teams"].push( "BlueJays" );
	zALEast["teams"].push( "Orioles" );
	zALEast["teams"].push( "Rays" );
	
	zALEast["winners"].push( "Yankees" ); //2006
	zALEast["winners"].push( "RedSox" );  //2007
	zALEast["winners"].push( "Rays" );    //2008
	zALEast["winners"].push( "Yankees" ); //2009
	zALEast["winners"].push( "Rays" );    //2010
	zALEast["winners"].push( "Yankees" ); //2011
	divisions.push( zALEast );
	
	var zALCentral = { "name":"American League Central", "teams": Array(), "winners": Array() };
	zALCentral["teams"].push( "Indians" );
	zALCentral["teams"].push( "Tigers" );
	zALCentral["teams"].push( "Twins" );
	zALCentral["teams"].push( "WhiteSox" );
	zALCentral["teams"].push( "Royals" );
	
	zALCentral["winners"].push( "Twins" );
	zALCentral["winners"].push( "Indians" );
	zALCentral["winners"].push( "WhiteSox" );
	zALCentral["winners"].push( "Twins" );
	zALCentral["winners"].push( "Twins" );
	zALCentral["winners"].push( "Tigers" );
	divisions.push( zALCentral );
	
	var zALWest    = { "name":"American League West", "teams": Array(), "winners": Array() };
	zALWest["teams"].push( "Angels" );
	zALWest["teams"].push( "Mariners" );
	zALWest["teams"].push( "Athletics" );
	zALWest["teams"].push( "Rangers" );
	
	zALWest["winners"].push( "Athletics" );
	zALWest["winners"].push( "Angels" );
	zALWest["winners"].push( "Angels" );
	zALWest["winners"].push( "Angels" );
	zALWest["winners"].push( "Rangers" );
	zALWest["winners"].push( "Rangers" );
	divisions.push( zALWest );
	
	worldseries["2006"] = "Cardinals";
	worldseries["2007"] = "Red Sox";
	worldseries["2008"] = "Phillies";
	worldseries["2009"] = "Yankees";
	worldseries["2010"] = "Giants";
	worldseries["2011"] = "Cardinals";
	
	wildcards["2006"] = Array("Tigers", "Dodgers");
	wildcards["2007"] = Array("Yankees", "Rockies");
	wildcards["2008"] = Array("Red Sox", "Brewers");
	wildcards["2009"] = Array("Red Sox", "Rockies");
	wildcards["2010"] = Array("Yankees", "Braves");
	wildcards["2011"] = Array("Rays", "Cardinals");
	
	initBarChart("2012", "#-of-wins");
	
}



///////////////////
//BAR CHART SET-UP
function initBarChart(req_relationship, filter_by){
	
	$("#info_text").html("This information visualization shows the payroll and wins per season for the 30 Major League Baseball teams over the past 6 years, the average payroll and wins, and a prediction for wins in the 2012 season. Hovering over the bar graphs for each team will provide you with additional details.");
	
	$("#current").html("<p>Predicting Major League Baseball 2012: <strong>Payroll vs Wins</strong></p>");
	d3.select("#vis").selectAll("svg").remove();
	
	var height  = ( 160 + ( (teamnames.length * 20) + (teamnames.length * 9) ) );
	
	//an array for the sorted team names based on the filter
	teamnames_sorted = Array();
	//start by sorting this team
	teamnames_sorted = sortTeams(filter_by, req_relationship);
	////(teamnames_sorted);
	
	//the bar chart will be showing payroll
	var payroll_subdata = Array();
	//AND win ammounts
	var winamt_subdata  = Array();
	
	//loop through the teams and get the data
	for(var i = 0; i < teamnames_sorted.length; i++)
	{
		//get the row of each team associated with the relationship
		//that was passed in as an argument to this function
		var trow   = teams[ teamnames_sorted[i] ][req_relationship];
		//grab the payroll and win amounts
		var trow_payroll = (trow["payroll"]);
		var trow_win_amt = (trow["#-of-wins"]);
		if(req_relationship == "2012"){
			trow_win_amt = trow["theoretical-2012-based-on-%-pre-error"];
		}
		//because payroll was stored as xxx,xxx,xxx.xx
		var trow_payroll = parseInt( trow_payroll.replace(/,/g,'') );
		var trow_win_amt = parseInt( trow_win_amt );
		//add those values into the data arrays
		payroll_subdata.push( trow_payroll );
		winamt_subdata.push( trow_win_amt );
	}
	
	$("#vis").css("height", (20 + height) + 'px').css("width","1100px");
	
	var vis = d3.select("#vis")
		.append("svg")
		.attr("height", height + 20)
		.attr("width", 1100);
	

	//CREATE THE POST SEASON STUFF
	postSeasonSpace( vis, req_relationship );
	
	
	//YEAR SELECTION
	//add the sliding bar to the top
	vis.append("g").attr("class","scroller")
			.selectAll("g.relation").data( relations )
			.enter().append("g").attr("class","relation")
			.attr("transform",function(d,i){
				var xpos = (80 * i) + 130;
				var ypos  = 45;
				return "translate(" + xpos + ", " + ypos + ")"; 
			}).append("text").text(function(d){ return d;})
			.attr("style","font-family:'LeagueGothicRegular';cursor:pointer")
			.attr("fill", function(d){
				if(d == "2012") return "#7da4a8";
				if(d == "AVG") return "#2c4a6f";
				else return "#444444";
			}).attr("font-size",function(d){
				if(d == "2012") return 34;
				else return 26;
			}).attr("stroke",function(d){
				if(d == "2012") return "#ffffff";
				else return "#ffffff";
			}).attr("stroke-width",function(d){
				if(d == "2012") return 0;
				else return 0;
			}).on("click",function(){
				slideAndLoad( d3.select(this).text(), filter_by );
			});
	
	
	//////////////
	//top menu (year selection
	///create a line as the base of the sliding triangle
	vis.append("line")
		.attr("x1",130).attr("y1", 60)
		.attr("stroke","#d9dee2")
		.attr("stroke-width",6)
		.attr("x2",720).attr("y2", 60);
	//create a group for the sliding triangle and put inside of it
	//a path object
	vis.append("g").attr("class","scroller_slider")
		.attr("transform",function(){
			
			var xpos, ypos;
			var index = 0;
			for(var j = 0; j < relations.length; j++){
				if(req_relationship == relations[j]){
					index = j;
					////(req_relationship + " = " + relations[j]);
				}
			}
			xpos = (index * 80) + 135;
			ypos = 50
			////(index)
			return "translate(" + xpos + ", " + ypos + ")"; 
			
		})
		.append("path").attr("d","M 0 10 L 10 0 L 20 10 L 0 10")
		.attr("stroke","#d9dee2").attr("stoke-width",3).attr("fill","#d9dee2");
	
	//////////////
	//key creation
	var subdata_keynames = ["payroll","wins"];
	
	var wopac, popac;
	var wope, pope;
	if(filter_by == "payroll"){
		wopac = 0;
		popac = 1;
		wope  = "none";
		pope  = "all";
	}else{
		wopac = 1;
		popac = 0;
		wope  = "all";
		pope  = "none";
	}
	
	//create the group that holds the two images that are visibile when sorting by win amount information
	vis.append("g").attr("class","win_sort").attr("transform","translate(820,20)")
					.attr("opacity", wopac).attr("pointer-events",wope)
					.on("click",function(){ d3.select(this).attr("opacity",0).attr("pointer-events","none")
											d3.select("#vis").selectAll(".payroll_sort").attr("opacity",1).attr("pointer-events","all");
											slideAndLoad(req_relationship, "payroll");})
					.selectAll("image").data( subdata_keynames ).enter().append("image")
					.attr("xlink:href",function(d){ 
						if(d=="payroll")
							return "./_imgs/payrollsort_active.png";
						else
							return "./_imgs/winsort_active.png";
					}).attr("width",80).attr("height",32)
					.attr("y",00).attr("x",function(d,i){
						return (i * 85);
					}).attr("style","cursor:pointer");
	
	//create the group that holds the two images that are visibile when sorting by payroll information
	vis.append("g").attr("class","payroll_sort").attr("transform","translate(820,20)")
					.attr("opacity", popac).attr("pointer-events", pope)
					.on("click",function(){ d3.select(this).attr("opacity",0).attr("pointer-events","none");
											d3.select("#vis").selectAll(".win_sort").attr("opacity",1).attr("pointer-events","all");
											slideAndLoad(req_relationship, "#-of-wins");})
					.selectAll("image").data( subdata_keynames ).enter().append("image")
					.attr("xlink:href",function(d){ 
						if(d=="payroll")
							return "./_imgs/payrollsort_inactive.png";
						else
							return "./_imgs/winsort_inactive.png";
					}).attr("width",80).attr("height",32)
					.attr("y",00).attr("x",function(d,i){
						return (i * 85);
					}).attr("style","cursor:pointer");
	
	d3.select("#vis").selectAll("svg").selectAll(".button_label").data(subdata_keynames).enter().append("text")
			.text(function(d){return d;}).attr("style","font-family:'BlueHighwayRegular';")
			.attr("fill","#ffffff").attr("x",function(d,i){ return (860 + (i * 85) );})
			.attr("font-size",16).attr("y",42).attr("text-anchor","middle").attr("pointer-events","none");
	

	//create the: "sort by" text"
	vis.append("text").text("Sort by")
			.attr("style","font-family:'LeagueGothicRegular'; font-size:26px")
			.attr("fill","#c9d2d6").attr("x",760).attr("y", 46).attr("pointer-events","none");
	
	
	//
	//CALCULATING: RANGE OF TOTAL LEAGUE PAYROLL VALUES 
	var league_payroll = Array();
	for(var q = 0; q < teamnames.length; q++){
		for(var g = 0; g < relations.length; g++){
			league_payroll.push( cleanNum( teams[teamnames[q]][relations[g]]["payroll"] ));
		}
	}	
	
	//
	//CALCULATING: RANGE OF TOTAL LEAGUE WIN AMOUNTS 
	var league_winamts = Array();
	for(var q = 0; q < teamnames.length; q++){
		for(var g = 0; g < relations.length; g++){
			if( relations[g] != "2012" ){
				league_winamts.push( parseInt( teams[teamnames[q]][relations[g]]["#-of-wins"] ));
			}else{
				league_winamts.push( parseInt( teams[teamnames[q]][relations[g]]["theoretical-2012-based-on-%-pre-error"] ));
			}
		}
	}	
	//get a scale for the payroll
	payroll_scale = d3.scale.linear()
		.domain([d3.min(league_payroll), d3.max(league_payroll)])
		.range([50, 590]);
	
	//get a scale for the win amounts
	winamt_scale = d3.scale.linear()
		.domain([d3.min(league_winamts), d3.max(league_winamts)])
		.range([50, 590]);
	
	/////////
	//scale creation
	vis.append("line").attr("class","graph_scale")
		.attr("x1",130).attr("y1", 130)
		.attr("stroke","#d9dee2")
		.attr("stroke-width",1)
		.attr("x2",720).attr("y2", 130);
	
	var money_ticks = Array();
	var builtin_ticks = payroll_scale.ticks(4);
	money_ticks.push( d3.max(payroll_subdata) );
	money_ticks.push( builtin_ticks[0] );
	money_ticks.push( builtin_ticks[1] );
	money_ticks.push( builtin_ticks[2] );
		
	var scaleTicks = vis.selectAll(".scale_ticks").data( builtin_ticks ).enter()
			.append("g").attr("class", "scale_ticks").attr("opacity",0.6);
			
	scaleTicks.append("text").attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
			.attr("fill","#444444")
			.attr("x", function(d){ return (130 + payroll_scale(d)); }).attr("y", 120)
			.attr("text-anchor", "middle")
			.text(function(d){
				var rstring;
				var inmils = d / 1000000;
				inmils = inmils.toFixed(0);
				rstring = "$" + inmils + " Million";
				return rstring;
			});
			
	scaleTicks.append("line")
		.attr("x1",function(d){
			return (130 + payroll_scale(d));
		}).attr("y1", 125)
		.attr("stroke","#d9dee2")
		.attr("stroke-width",1)
		.attr("x2",function(d){
			return (130 + payroll_scale(d));
		}).attr("y2", height);	
	
	
	/////////
	//graph creation
	//create groups for each of the team (each group will have 2 bars)
	vis.selectAll(".team_bars_container").data( teamnames_sorted ).enter().append("g")
		.attr("class","team_bars_container").attr("transform",function(d,i){
			var xpos = 0;
			var ypos = 150 +( (i * 20) + (i * 9) );
			return "translate("+xpos+","+ypos+")";
	}).attr("opacity",0.6).on("mouseover",function(d){
	
		teamtooltip(req_relationship, d3.select(this), payroll_scale, winamt_scale, height);
		d3.select(this).attr("opacity",1.0);
		d3.selectAll(".post_season_stuff").transition().duration(400)
			.attr("opacity",0.0);
	
	}).on("mouseout",function(){ 
		d3.selectAll(".team_tooltip").transition().duration(300)
					.attr("opacity",0).each("end",function() {
						d3.select(this).remove();
					});
		d3.selectAll(".team_bars_container").transition().duration(50).attr("opacity",0.6);
		//d3.select(this).attr("opacity",0.6);
		
		
		d3.select(this).select(".team_bar_bg").transition()
				.attr("fill","#ffffff").attr("opacity",0)
				.attr("width", function(d,i){
					var indx = teamnames_sorted.indexOf( d );
					var apmt  = payroll_subdata[indx];
					var spamt = payroll_scale(apmt);
					var awmt  = winamt_subdata[indx];
					var swamt = winamt_scale(awmt);
					return d3.max([spamt,swamt]); 
				})
				.attr("ry",0).attr("rx",0);
		
		d3.timer.flush();
		d3.selectAll(".scale_ticks").transition().duration(100)
				.attr("opacity",0.6);	
		
		d3.selectAll(".hover_marker").transition()
				.duration(100).attr("opacity",0.0).each("end",function(){
					d3.select(this).remove();
				});
				
		d3.selectAll(".sliding_amount_value").transition()
				.duration(100).attr("opacity",0.0).each("end",function(){
					d3.select(this).remove();
				});
		
		d3.selectAll(".post_season_stuff").transition().duration(300)
			.attr("opacity",1.0);
		
	});
	
	//add a background rectangle to handle the pointer events
	d3.selectAll(".team_bars_container").append("rect").attr("class","team_bar_bg")
		.attr("x",125).attr("height",20).attr("width",function(d,i){
			var apmt  = payroll_subdata[i];
			var spamt = payroll_scale(apmt);
			
			var awmt  = winamt_subdata[i];
			var swamt = winamt_scale(awmt);	
			
			return d3.max([spamt,swamt]); 
		})
		.attr("fill","#ffffff").attr("opacity",0);
	
	//add the team name to the group
	d3.selectAll(".team_bars_container").append("text")
		.text(function(d){ return d; }).attr("fill","#444444")
		.attr("style","font-family:'BlueHighwayRegular'; font-size:16px; cursor:pointer; font-weight:normal;")
		.attr("y",16).attr("text-anchor","end").attr("x",115)
		.on("click", function(d){
			$("#all").removeClass("all_on").addClass("all_off");
			$("#indi").removeClass("indi_off").addClass("indi_on");
			initbubble( d ); 
		});
	
	//add the rectangle that represents the payroll data
	d3.selectAll(".team_bars_container").append("rect")
		.attr("class","team_payroll_data").attr("x",130)
		.attr("stroke","#ffffff").attr("stroke-width",1)
		.attr("height",9).attr("fill","#c2bca4")
		.attr("pointer-events","none")
		.transition().duration(600).attr("width",function(d,i){ 
			var amt  = payroll_subdata[i];
			var samt = payroll_scale(amt);
			return samt; 
	});
	
	//add the rectangle that represents the payroll data
	d3.selectAll(".team_bars_container").append("rect")
		.attr("class","team_winamt_data").attr("x",130)
		.attr("stroke","#ffffff").attr("stroke-width",1)
		.attr("pointer-events","none")
		.attr("y",11).attr("height",9).attr("fill","#9dbab5")
		.transition().duration(600).attr("width",function(d,i){ 
			var amt  = winamt_subdata[i];
			var samt = winamt_scale(amt);
			return samt; 
	});
	
}

///////////////////
//CALLED ON HOVER OF ONE
//OF THE BASEBALL TEAMS
function teamtooltip(req_relationship, d3selection, payroll_scale, win_scale, svg_height){

	//clear any unwanted tooltips already on there
	d3.selectAll(".team_tooltip").transition().duration(300)
					.attr("opacity",0).each("end",function() {
						d3.select(this).remove();
					});
	
	retreiveDivision( d3selection.data() );
	
	var scale_ticks  = d3.selectAll(".scale_ticks").data();
	var hl_payroll   = cleanNum( teams[ d3selection.data() ][req_relationship]["payroll"] );
	if(req_relationship != "2012"){
		var hl_winamt    = parseInt( teams[ d3selection.data() ][req_relationship]["#-of-wins"] );
	}else{
		var hl_winamt    = parseInt( teams[ d3selection.data() ][req_relationship]["theoretical-2012-based-on-%-pre-error"] );
	}
	hl_winamt = hl_winamt.toFixed(0)
	
	var hl_dpw       = hl_payroll / hl_winamt;
	hl_dpw = hl_dpw / 1000000;
	hl_dpw = hl_dpw.toFixed(2);
	
	var closest_tick = scale_ticks[0];
	var closest_indx = 0;
	var closest_dist = Math.abs( closest_tick - hl_payroll );
	
	for(var i = 0; i < scale_ticks.length; i++){
		var temp_dist = Math.abs( scale_ticks[i] - hl_payroll );
		if(temp_dist < closest_dist){
			closest_dist = temp_dist;
			closest_indx = i;
			closest_tick = scale_ticks[i];
		}
	}
	var created = false;
	// d3.timer.flush();
	d3.selectAll(".scale_ticks").transition().duration(200)
		.delay(300).attr("opacity",0.0)
		.each("end",function(){
			if( !created ){
				created = true;
				
				d3.selectAll(".team_bars_container").each(function(){
					if( d3.select(this).data()[0]  != d3selection.data()[0] ){
						d3.select(this).transition().duration(300).attr("opacity",0.2);
					}
				});
				
				d3.select("#vis").selectAll("svg").append("line")
					.attr("class","hover_marker")
					.attr("x1",0).attr("x2",0)
					.attr("y1",95).attr("y2",svg_height)
					.attr("stroke","#c2bca4")
					.attr("opacity",0.0)
					.attr("pointer-events","none")
					.attr("stroke-width",2).transition().duration(300)
					.attr("opacity",1.0)
					.attr("x1",function(){
						return (130 + payroll_scale( hl_payroll ));
					}).attr("x2",function(){
						return (130 + payroll_scale( hl_payroll ));
					});
					
				d3.select("#vis").selectAll("svg").append("line").attr("x1",0).attr("x2",0)
					.attr("y1",120).attr("y2",svg_height)
					.attr("class","hover_marker")
					.attr("opacity",0.0)
					.attr("pointer-events","none")
					.attr("stroke","#9dbab5")
					.attr("stroke-width",2).transition().duration(300)
					.attr("opacity",1.0)
					.attr("x1",function(){
						return (130 + win_scale( hl_winamt ));
					}).attr("x2",function(){
						return (130 + win_scale( hl_winamt ));
					});
				
				
				var sliding_payroll_text = d3.select("#vis").selectAll("svg").append("g")
					.attr("class","sliding_amount_value")
					.attr("transform","translate(130,90)")
					.attr("opacity",0.0);
				
				var payroll_rect_box   = sliding_payroll_text.append("rect")
					.attr("width",125).attr("height",25)
					.attr("fill","#c2bca4").attr("x",0).attr("y",-20)
					.attr("ry",5).attr("rx",5);
					
				var payroll_text_chunk = sliding_payroll_text.append("text")
					.attr("style","font-family:'BlueHighwayRegular'; font-size:16px; cursor:pointer")
					.attr("x",62.5).attr("y",-2).text( '$' + (hl_payroll / 1000000).toFixed(2) + ' million')
					.attr("text-anchor","middle").attr("fill","#ffffff");
					
				sliding_payroll_text.transition().duration(300)
				.attr("opacity",1.0)
				.attr("transform",function(){
					var xpos = (68 + payroll_scale( hl_payroll ));
					var ypos = 90;
					return "translate("+xpos+","+ypos+")";
				});
				
				
				
				var sliding_win_text = d3.select("#vis").selectAll("svg").append("g")
					.attr("class","sliding_amount_value")
					.attr("transform","translate(130,120)")
					.attr("opacity",0.0);
				
				var win_rect_box   = sliding_win_text.append("rect")
					.attr("width",80).attr("height",25)
					.attr("fill","#9dbab5").attr("x",0).attr("y",-20)
					.attr("ry",5).attr("rx",5);
					
				var win_text_chunk = sliding_win_text.append("text")
					.attr("style","font-family:'BlueHighwayRegular'; font-size:16px; cursor:pointer")
					.attr("x",40).attr("y",-2).text( hl_winamt + ' wins')
					.attr("text-anchor","middle").attr("fill","#ffffff");
					
				sliding_win_text.transition().duration(300).attr("transform",function(){
					var xpos = (90 + win_scale( hl_winamt ));
					var ypos = 120;
					return "translate("+xpos+","+ypos+")";
				}).attr("opacity",1.0);
			}
		});

	//transition the teams' background bar to be visible and extended
	var tg = d3selection.select(".team_bar_bg").transition()
				.attr("fill","#ebeef0").attr("opacity",1)
				.attr("width",610)
				.attr("ry",0).attr("rx",0).each("end", function(){
				
				var tt = d3selection.append("g").attr("class","team_tooltip")
					.attr("transform","translate(760,0)")
					.attr("pointer-events","none");
		
				//the path to make the end of the rectangle appear pointed			
				var ttp = tt.append("path").attr("d","M -25 0 L 0 10 L -25 20 L -25 0")
					.attr("fill","#ffffff").transition().duration(300).attr("fill","#ebeef0")
					.attr("pointer-events","none"); 
	
				//the rectangle that acts as a bg for the info
				var ttr = tt.append("rect").attr("width",290).attr("height",function(d){
						if( isdivisionwinner(d, req_relationship) || isWildCardWinner(d, req_relationship) ){
							return 105;
						}else{
							return 75;
						}
					}).attr("fill","#d8dee1").attr("y",function(d,i){
						if( teamnames_sorted.indexOf(d) > (teamnames.length / 2) )
							return -60;
						else
							return -25;
					}).attr("pointer-events","none")
					.attr("rx",5).attr("ry",5).attr("opacity",0.0)
					.transition().duration(300).attr("opacity",1.0)
					.each("end",function(){
						
						//ADD TEXT: NAME OF TEAM
						tt.append("text").text(function(d){
							if(req_relationship != "AVG" && req_relationship != "2012"){
								return (' ' + retrievecity(d) + ' ' + d+  ' (' + req_relationship + ')');
							}
							if(req_relationship == "2012"){
								return ('' + retrievecity(d) + ' ' + d + ' (Predicted ' + req_relationship + ')');
							}
							else{
								return ('The ' + retrievecity(d) + ' ' + d + ' (' + req_relationship + ')');	
							}
						}).attr("style","font-family:'LeagueGothicRegular'; font-size:24px")
						.attr("x",10).attr("y",function(d,i){
						if( teamnames_sorted.indexOf(d) > (teamnames.length / 2) )
							return -25;
						else
							return 10;
						}).transition().duration(300).attr("fill","#555555");
						
						//
						//DOLLARS PER WIN
						tt.append("text").text("Dollars per win:").attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
						.attr("x",10).attr("y",function(d,i){
							if( teamnames_sorted.indexOf(d) > (teamnames.length / 2) )
								return 0;
							else
								return 35;
						}).attr("fill","#888888").attr("text-anchor","start")
						.append("tspan").text(function(d){
							var pstring = "$";
							var pnum    = cleanNum(teams[d][req_relationship]["$-per-win"]) / 1000000;
							
							if( req_relationship == "2012" ){
								var p2012 = cleanNum(teams[d][req_relationship]["payroll"]);
								var w2012 = cleanNum(teams[d][req_relationship]["theoretical-2012-based-on-%-pre-error"]);
								pnum = (p2012 / w2012);
								pnum = pnum / 1000000; 
							}
							
							return pstring + '' + pnum.toFixed(2) + ' million';
						}).attr("dx",10).attr("dy",0).attr("text-anchor","start")
						.attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
						.transition().duration(300).attr("fill","#444444");
						
						if(isdivisionwinner(d3.select(this).data(), req_relationship)){						
							tt.append("text").text(function(d){
								var champ = isdivisionwinner(d, req_relationship);
								return champ + " Champ";
							}).attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
							.attr("x",10).attr("y",function(d,i){
								if( teamnames_sorted.indexOf(d) > (teamnames.length / 2) )
									return 25;
								else
									return 60;
							}).attr("fill","#2b496d");
						}
						
						if( isWildCardWinner(d3.select(this).data(), req_relationship) ){
							tt.append("text").text("Wild Card Winner")
							.attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
							.attr("x",10).attr("y",function(d,i){
								if( teamnames_sorted.indexOf(d) > (teamnames.length / 2) )
									return 25;
								else
									return 60;
							}).attr("fill","#2b496d");
							
							tt.selectAll("rect").attr("height",115);
						}
						
						if( isWorldSeriesWinner(d3.select(this).data(), req_relationship) ){
							tt.append("text").text("World Series Winner")
							.attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
							.attr("x",10).attr("y",function(d,i){
								if( teamnames_sorted.indexOf(d) > (teamnames.length / 2) )
									return 40;
								else
									return 80;
							}).attr("fill","#2b496d");
							
							tt.selectAll("rect").attr("height",115);
						}
					});
				});
}

///////////////////////////////////
//CALLED ON LOAD AND WHENEVER
//THE MOUSE IS OFF OF THE INDIVIDUAL 
//BARS
//displays the division winners / wild cards / world series
function postSeasonSpace( svgcont, whatYear ){

	if( whatYear == "AVG"){
		return false;
	}
	var psg = svgcont.append("g").attr("class","post_season_stuff")
		.attr("opacity",0.0).attr("transform","translate(760,130)");
	
	psg.append("rect").attr("width",300).attr("height", 280)
			.attr("fill","#d9dee2")
			.attr("rx",5).attr("ry",5);
	
	psg.append("text").text(function(){
		if(whatYear == "2012"){
			return whatYear + ' Post Season Predictions';
		}else{
			return whatYear + ' Post Season';
		}
	}).attr("style","font-family:'LeagueGothicRegular'; font-size:24px")
	.attr("x",10).attr("y",30).attr("fill","#444444");
	
	if(whatYear == 2012){
		
		predictionPostSeason( psg );
		return true;
	
	}
	var indx = divisionIndex( whatYear );
	var text_labels = Array();
	var post_values = Array();
	
	text_labels.push( "NL East Champ" );
	post_values.push( divisions[0]["winners"][indx] );
	
	text_labels.push( "NL Central Champ" );
	post_values.push( divisions[1]["winners"][indx] );
	
	text_labels.push( "NL West Champ" );
	post_values.push( divisions[2]["winners"][indx] );
	
	text_labels.push( "AL East Champ" );
	post_values.push( divisions[3]["winners"][indx] );
	
	text_labels.push( "AL Central Champ" );
	post_values.push( divisions[4]["winners"][indx] );
	
	text_labels.push( "AL West Champ" );
	post_values.push( divisions[5]["winners"][indx] );
	
 	text_labels.push( "AL Wild Card" );
	post_values.push( wildcards[ whatYear ][0] )
	
	text_labels.push( "NL Wild Card" );
	post_values.push( wildcards[ whatYear ][1]);
	
	
	text_labels.push( "World Series Winner" );
	post_values.push( worldseries[ whatYear ] );
	
	var psgig = psg.selectAll(".post_season_infobit").data( post_values )
		.enter().append("g").attr("class","post_season_infobit")
		.attr("transform",function(d,i){
			var xpos = 10;
			var ypos = 55 + ( i * 25 );
			return "translate("+xpos+","+ypos+")";
		});
		
	psgig.append("text").text(function(d,i){
		return text_labels[i];
	}).attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
	.attr("fill",function(d,i){
		
		if(text_labels[i] =='World Series Winner' ){
			return "#2c4a6f";
		}
	
		return "#888888";
		
	}).attr("x",0).attr("text-anchor","start");
	
	psgig.append("text").text(function(d){
		return d;
	}).attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
	.attr("x",160).attr("fill","#444444");
	
	psg.transition().duration(300).attr("opacity",1.0);
}

function predictionPostSeason( psg ){
	
	var text_labels = Array();
	var post_values = Array();
	
	text_labels.push( "NL East Champ" );
	post_values.push( "Phillies" );
	
	text_labels.push( "NL Central Champ" );
	post_values.push( "Brewers");
	
	text_labels.push( "NL West Champ" );
	post_values.push( "Giants" );
	
	text_labels.push( "AL East Champ" );
	post_values.push( "Yankees" );
	
	text_labels.push( "AL Central Champ" );
	post_values.push( "Tigers" );
	
	text_labels.push( "AL West Champ" );
	post_values.push( "Angles" );
	
 	text_labels.push( "AL Wild Card #1" );
	post_values.push( "Red Sox" );
	text_labels.push( "AL Wild Card #2" );
	post_values.push( "Rangers" );
	
	text_labels.push( "NL Wild Card #1" );
	post_values.push( "Dodgers" );
	text_labels.push( "NL Wild Card #2" );
	post_values.push( "Cardinals" );
	
	var psgig = psg.selectAll(".post_season_infobit").data( post_values )
		.enter().append("g").attr("class","post_season_infobit")
		.attr("transform",function(d,i){
			var xpos = 10;
			var ypos = 55 + ( i * 25 );
			return "translate("+xpos+","+ypos+")";
		});
		
	psgig.append("text").text(function(d,i){
		return text_labels[i];
	}).attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
	.attr("fill",function(d){
		return "#888888";
	}).attr("x",0).attr("text-anchor","start");
	
	psgig.append("text").text(function(d){
		return d;
	}).attr("style","font-family:'BlueHighwayRegular'; font-size:16px")
	.attr("x",160).attr("fill","#444444");
	
	psg.selectAll("rect").attr("height",300);
	psg.transition().duration(300).attr("opacity",1.0);
	
}

///////////////////
//CALLED WHEN ONE OF THE
//YEARS IS CLICKED ON THE
//BAR CHAR
function slideAndLoad( req_relationship, filter_by ){
	
	console.log( req_relationship );
	console.log( filter_by );
	
	teamnames_sorted = sortTeams(filter_by, req_relationship);
	
	//the bar chart will be showing payroll
	var payroll_subdata = Array();
	//AND win ammounts
	var winamt_subdata  = Array();
	
	//loop through the teams and get the data
	for(var i = 0; i < teamnames_sorted.length; i++)
	{
		//get the row of each team associated with the relationship
		//that was passed in as an argument to this function
		var trow   = teams[ teamnames_sorted[i] ][req_relationship];
		//grab the payroll and win amounts
		var trow_payroll = (trow["payroll"]);
		var trow_win_amt = (trow["#-of-wins"]);
		if(req_relationship == "2012"){
			trow_win_amt = trow["theoretical-2012-based-on-%-pre-error"];
		}
		//because payroll was stored as xxx,xxx,xxx.xx
		var trow_payroll = parseInt( trow_payroll.replace(/,/g,'') );
		var trow_win_amt = parseInt( trow_win_amt );
		//add those values into the data arrays
		payroll_subdata.push( trow_payroll );
		winamt_subdata.push( trow_win_amt );
	}
	
	d3.selectAll("post_season_stuff").transition().duration(300)
		.attr("opacity",0.0);
	
	d3.select(".scroller_slider").transition().duration(500)
	.ease("cubic").attr("transform",function(){
			
		var xpos, ypos;
		var index = 0;
		for(var j = 0; j < relations.length; j++){
			if(req_relationship == relations[j]){
				index = j;
				////(req_relationship + " = " + relations[j]);
			}
		}
		xpos = (index * 80) + 135;
		ypos = 50;
		////(index)
		return "translate(" + xpos + ", " + ypos + ")"; 
			
	}).each("end", function(){ 
	
		var groups = d3.selectAll(".team_bars_container");
		groups.on("mouseover",function(d){
			var height  = ( 160 + ( (teamnames.length * 20) + (teamnames.length * 9) ) );
			teamtooltip(req_relationship, d3.select(this), payroll_scale, winamt_scale, height);
			d3.select(this).attr("opacity",1.0);
			d3.selectAll(".post_season_stuff").transition().duration(400)
				.attr("opacity",0.0);
		});
		
		groups.transition().duration(300)
			.attr("transform",function(d){
				var i = teamnames_sorted.indexOf( d );
				var xpos = 0;
				var ypos = 150 +( (i * 20) + (i * 9) );
				return "translate("+xpos+","+ypos+")";
			});
		var bars = groups.selectAll('.team_payroll_data');
		var barz = groups.selectAll('.team_winamt_data');
		bars.transition().duration(300)
			.attr("width",function( d ){
				var i = teamnames_sorted.indexOf( d );
				var amt  = payroll_subdata[i];
				var samt = payroll_scale(amt);
				return samt;
			});
		barz.transition().duration(300)
			.attr("width",function( d ){
				var i = teamnames_sorted.indexOf( d );
				var amt  = winamt_subdata[i];
				var samt = winamt_scale(amt);
				return samt;
			});
		//setTimeout(function() { initBarChart( req_relationship, filter_by ) }, 300);
		//initBarChart( req_relationship );
	});
	
	var vis = d3.select("#vis")
				.selectAll("svg");
	
	//CREATE THE POST SEASON STUFF
	postSeasonSpace( vis, req_relationship );
	
	
	var subdata_keynames = ["payroll","wins"];
	
	var wopac, popac;
	var wope, pope;
	if(filter_by == "payroll"){
		wopac = 0;
		popac = 1;
		wope  = "none";
		pope  = "all";
	}else{
		wopac = 1;
		popac = 0;
		wope  = "all";
		pope  = "none";
	}
	
	//create the group that holds the two images that are visibile when sorting by win amount information
	d3.selectAll(".win_sort")
					.attr("opacity", wopac).attr("pointer-events",wope)
					.on("click",function(){ d3.select(this).attr("opacity",0).attr("pointer-events","none")
											d3.select("#vis").selectAll(".payroll_sort").attr("opacity",1).attr("pointer-events","all");
											slideAndLoad(req_relationship, "payroll");});
	
	//create the group that holds the two images that are visibile when sorting by payroll information
	d3.selectAll(".payroll_sort")
					.attr("opacity", popac).attr("pointer-events", pope)
					.on("click",function(){ d3.select(this).attr("opacity",0).attr("pointer-events","none");
											d3.select("#vis").selectAll(".win_sort").attr("opacity",1).attr("pointer-events","all");
											slideAndLoad(req_relationship, "#-of-wins");});
		
}


///////////////////
//BUBBLE CHART SET-UP
function initbubble( name ){
	
	
	setTimeout(function(){ checkLeftovers(); }, 100);
	
	d3.select("#vis").selectAll("svg").remove();
	var city = retrievecity( name );
	
	$("#info_text").html("This info vis shows the payroll and wins of the [" + city + ' ' + name + "] over their last 6 years, as well as a prediction for the 2012 season. Hovering over each circle will give you more information about that team during a specific year.");
	
	var fullname = retrievecity(name) + " " + name;
	
	$("#current").html("<p>Predicting Major League Baseball 2012: <strong>Team by Team Analysis</strong></p>");
	//get the city associated with this team
	//var city = retrievecity( name );
	
	//
	//three-dimensional info vis:
	var percent_subdata = Array(); //array for: win amounts for the team
	var payroll_subdata = Array(); //array for: payroll amounts for the team
	var years_subdata   = Array(); //attay for: years of the team's history
	
	//loop through the main data array getting each yearly data from the team
	for(var i = 0; i < relations.length; i++){
		//get a temp relationship ("2006",...)
		var trel = relations[i];
		//skip the average stats (not really applicable
		if(trel == "AVG") continue;
		//get the whole row from the teams array for this team, and this relation
		var trow = teams[ name ][ trel ];
		//get the payroll data
		var tpay = trow["payroll"];
		//get the number of wins
		var trow_win_amt = (trow["#-of-wins"]);
		//if the relationship in question is 2012, adjust
		if(trel == "2012"){
			trow_win_amt = trow["theoretical-2012-based-on-%-pre-error"];
		}
		//get the accutate integer value for the payroll number
		tpay = parseInt( tpay.replace(/,/g,'') );
		//get the integer value from the win amount
		trow_win_amt = parseInt( trow_win_amt );
		
		//fill the arrays with the correct data
		percent_subdata.push( trow_win_amt );
		payroll_subdata.push( tpay );
		years_subdata.push( parseInt( trel ) );
	}
	
	//set the style of the container div
	$("#vis").css("height",'800px').css("width","1100px");
	
	//set variables for the chart's style
	var chart_ystart  = 100;
	var chart_yheight = 500;
	var chart_xstart  = 140;
	var chart_xwidth  = 600;
	
	//add the svg tag to the div
	var vis = d3.select("#vis")
		.append("svg")
		.attr("height", 800)
		.attr("width", 1100);
	//
	//ADDING TO SVG: NAME OF CITY AND TEAM
	vis.append("text").text(city + " " + name)
		.attr('x',450).attr('text-anchor','middle')
		.attr('y',50).attr("style","font-family:'LeagueGothicRegular'; font-size:42px; font-style:normal; cursor:pointer;")
		.attr("fill","#444444").on("click",function(){
			if($('.dropdown').length > 0){
				//console.log("hello");
				d3.selectAll(".dropdown").transition().duration(300)
						.attr("opacity",0.0).each("end",function(){
							d3.select(this).remove();
						});
						
				d3.selectAll(".team_data_group").attr("pointer-events","all")
				.transition().duration(300)
					.attr("opacity",1.0);
				d3.selectAll(".team_data_text").attr("pointer-events","none")
				.transition().duration(300)
					.attr("opacity",1.0);
				d3.selectAll(".team_data_circ").attr("pointer-events","all")
					.transition().duration(300)
					.attr("opacity",1.0);
				
			}else{
				
				d3.selectAll(".team_data_group").attr("pointer-events","none")
				.transition().duration(300)
					.attr("opacity",0.2);
				d3.selectAll(".team_data_text").attr("pointer-events","none")
				.transition().duration(300)
					.attr("opacity",0.2);
				d3.selectAll(".team_data_circ").attr("pointer-events","none")
				.transition().duration(300)
					.attr("opacity",0.2);
				
				dropDownTeam();
			}
		});
	//
	//ADDING TO SVG: NAME OF THE Y-AXIS INFORMATION
	var labelg = vis.append("g").attr("class","y_label")
					.attr("transform","translate(40,400) rotate(-90,10,0)")
					.attr("style","font-family:'LeagueGothicRegular'; font-size:22px; font-style:normal;")
					.attr("fill","#444444");
	var ytext = labelg.append("text").text("Season Payroll");
	
	//
	//ADDING TO SVG: LINE REPRESENTATION OF Y-AXIS
	var yline = vis.append("line").attr("x1",130).attr("x2",130)
					.attr("y1",chart_ystart).attr("y2", (chart_ystart + chart_yheight) ).attr("stroke","#d8d8d8")
					.attr("stroke-width",1);
		
	//
	//ADDING TO SVG: "MILLIONS" TEXT THAT APPEARS ON Y-AXIS 			
	var ykey = vis.append("text").text("Millions").attr("y",105).attr("x",100)
					.attr("text-anchor","end").attr("fill","#444444")
					.attr("style","font-family:'LeagueGothicRegular'; font-size:22px; font-style:normal;");	
	
	//
	//CALCULATING: RANGE OF TOTAL LEAGUE PAYROLL VALUES 
	var league_payroll = Array();
	for(var q = 0; q < teamnames.length; q++){
		for(var g = 0; g < relations.length; g++){
			league_payroll.push( cleanNum( teams[teamnames[q]][relations[g]]["payroll"] ));
		}
	}	
	
	//
	//CALCULATING: Y SCALE BASED ON LEAGUE PAYROLL RANGES 
	var yscale = d3.scale.linear()
		.domain([ ( d3.min(league_payroll) ), d3.max(league_payroll)])
		.range([0, -chart_yheight]);
	
	//
	//CALCULATING: Y SCALE MARKERS BASED ON Y SCALE
	var descending = yscale.ticks(5);
	var top = ( d3.max(payroll_subdata) );
	
	//
	//ADDING TO SVG: Y-SCALE MARKERS ALONG THE Y-AXIS
	var yticks = vis.selectAll(".bubbleticks").data( descending )
			.enter().append("text").attr("class","bubbleticks")
			.text(function(d){ return ( '$' + ( (d / 1000000).toFixed(2) ) ); })
			.attr("y",function(d,i){
				var ypos = ( (chart_ystart + chart_yheight) + (yscale(d)) );
				return ypos;
			}).attr("x",125).attr("style","font-family:'LeagueGothicRegular'; font-size:22px; font-style:normal;")
			.attr("text-anchor","end").attr("fill","#9da2a5");
			
	//
	//ADDING TO SVG: X-AXIS REPRESENTATIVE LINE
	var xline = vis.append("line").attr("x1",130).attr("x2", (130 + chart_xwidth))
					.attr("y1", (chart_ystart + chart_yheight) ).attr("y2", (chart_ystart + chart_yheight) ).attr("stroke","#d8d8d8")
					.attr("stroke-width",1);
	
	//
	//ADDING TO SVG: X-AXIS SCALE MARKERS (YEAR INFORMATION)			
	var xticks = vis.selectAll(".yearticks").data( years_subdata )
						.enter().append("text").attr("class","yearticks")
						.attr("text-anchor","middle")
						.attr("y", ((chart_ystart + chart_yheight) + 22) )
						.attr("fill",function(d){
							if(d == "2012"){
								return "#75999b";
							}else{
								return "#444444";	
							}
						}).text(function(d){ return d+''; })
						.attr("style","font-family:'LeagueGothicRegular'; font-size:22px; font-style:normal;")
						.attr("x",function(d,i){
							var xpos = 150 + (i * ( chart_xwidth / 7 ));
							return xpos; 
						});
	
	//reverse the payroll data from the most to least
	var reversed = payroll_subdata; 
	
	//
	//ADDING TO SVG: HORIZONTAL LINES AT THE Y LEVEL ASSOCIATED WITH PAYROLL 
	var yeargroups = vis.selectAll(".team_data_group").data( reversed )
						.enter().append("g").attr("class","team_data_group")
						.attr("transform",function(d){
							var ypos;
							var xpos = 0;
							var ypos = (chart_ystart + chart_yheight) + yscale(d);
						
							return "translate(" + xpos + ", " + ypos + ")";
						});
	var bars = vis.selectAll(".team_data_group").append("line")
					.attr("class","team_data_bar")
					.attr("y1",0).attr("y2",0).attr("opacity",0)
					.attr("x1",130).attr("stroke-width",1).attr("stroke","#d8d8d8")
					.transition().duration(800)
					.attr("opacity",1)
					.attr("x2",function(d,i){
						var xpos = chart_xstart + (i * ( chart_xwidth / 7 ));
						return xpos;
					}).attr("stroke","#d8d8d8").attr("stroke-width",1);
	
	//
	//ADDING TO SVG: CIRCLES REPRESENTING THE AMOUNT OF WINS
	var circs = vis.selectAll(".team_data_circ").data( reversed )
					.enter().append("circle")
					.attr("style","cursor:pointer")
					.attr("class","team_data_circ")
					.attr("cy",function(d){
						return (chart_ystart + chart_yheight) + (yscale(d));
					}).attr("cx",130).attr("r",0)
					.attr("stroke","#cfcfcf").attr("stroke-width",0)
					.on("mouseover",function(d,i){
						
						d3.select(this).transition().duration(400)
								.attr("stroke-width",4.0).ease("elastic");
						loadSoloToolTip( name, years_subdata[i] );
					
					}).on("mouseout",function(){
						
						d3.select(this).transition().duration(400)
								.attr("stroke-width",0.0);
						d3.select("#vis").selectAll("svg")
							.selectAll(".solo_team_tooltip_temp").transition().duration(400)
								.attr("opacity",0.0).each("end",function(){
									d3.select(this).remove();
								});
						
					}).on("click",function(d,i){
					
						d3.select("#vis").selectAll("svg")
							.selectAll(".solo_team_tooltip_temp").attr("class","solo_team_tooltip_perm");
					
					}).transition().delay(function(d,i){
						return (i * 100);
					}).duration(300)
					.attr("cx",function(d,i){
						var xpos = 150 + (i * ( chart_xwidth / 7 ));
						return xpos;
					}).attr("r",function(d,i){
						////( years_subdata[i] + " : " + percent_subdata[i] );
						return (percent_subdata[i] / 3);
					}).attr("fill",function(d,i){  
						
						if(years_subdata[i] == 2012){
							return "#7da4a8";	
						}
						
						var winamt = percent_subdata[i];
						if( winamt < 55 ){
							return "#f7e7e8";
						}
						if( winamt >= 55 && winamt < 65 ){
							return "#e8b7bb";
						}
						if(  winamt >= 65 && winamt < 75 ){
							return "#d8868e";
						}
						if( winamt >= 75 && winamt < 85 ){
							return "#d16e77";
						}
						if( winamt >= 85 && winamt < 95 ){
							return "#c95661";
						}
						else{
							return "#c13e4a";
						}	
					}).attr("opacity",1);
	
	//
	//ADDING TO SVG: WIN AMOUNT TEXTS THAT ARE PLACED INSIDE OF CIRCLES		
	var amttexts = vis.selectAll(".team_data_text").data( reversed )
						.enter().append("text").attr("class","team_data_text").attr("pointer-events","none")
						.attr("style","font-family:'LeagueGothicRegular'; font-size:26px; font-style:normal;")
						.attr("fill","#ffffff").attr("x", function(d,i){
							var xpos = 150 + (i * ( chart_xwidth / 7 ));
							return xpos;
						}).attr("text-anchor","middle").text(function(d,i){
							return ( parseInt(percent_subdata[i]).toFixed(0) + '')
						}).attr("y", function(d){
							return  ((10 + chart_ystart + chart_yheight) + yscale(d));
						}).attr("opacity",0)
						.transition().delay(function(d,i){
							return (300 + (i * 50));
						}).duration(300)
						.attr("opacity",1);
						 
	var curindx = teamnames.indexOf( name );
	var preindx = curindx - 1;
	if( preindx < 0 ){
		preindx = (teamnames.length - 1);
	}
	var nexindx = curindx + 1;
	if( nexindx > (teamnames.length - 1) ){
		nexindx = 0;
	}
	
	var bub_nav = vis.append("g").attr("class","bubble_navigation")
					.attr("transform","translate(450, 20)");
	
	var bub_nav_opts = bub_nav.selectAll(".nav_opt")
					.data( [ teamnames[preindx], teamnames[nexindx] ])
					.enter().append("image")
					.attr("xlink:href",function(d,i){
						if(i == 0){
							return "http://www.sizethreestudios.com/Projects/_moneyball/_imgs/single_pev.png";
						}else{
							return "http://www.sizethreestudios.com/Projects/_moneyball/_imgs/single_next.png";
						}
					}).attr("x",function(d,i){
						if(i == 0){
							return -300;
						}else{
							return 300;
						}
					}).attr("width",31).attr("height",31)
					.attr("style","cursor:pointer")
					.on("click",function(d){
						
						d3.selectAll(".team_data_group").selectAll(".team_data_bar").remove();
						d3.selectAll(".team_data_circ").transition()
								.delay(function(d,i){
									return (0 + (i * 50));
								}).duration(300)
								.attr("opacity",0).attr("cx",100).attr("r",0);
						d3.selectAll(".team_data_text").transition()
								.delay(function(d,i){
									return (0 + (i * 50));
								}).duration(300)
								.attr("opacity",0).attr("x",0).each("end",function(){
									initbubble( d );
								});
					});
}

///////////////////
//CALLED WHEN HOVERING ON A 
//SPECIFIC YEAR DURING TEAM
//BY TEAM INFORMATION
function loadSoloToolTip( name, year ){
	
	d3.select("#vis").selectAll("svg")
		.selectAll(".solo_team_tooltip_temp").remove();
	
	d3.select("#vis").selectAll("svg")
		.selectAll(".solo_team_tooltip_perm").remove();
	
	var vtg = d3.select("#vis").selectAll("svg").append("g")
		.attr("class","solo_team_tooltip_temp")
		.attr("transform","translate(740,100)")
		.attr("opacity",0.0);
	
	var vtr = vtg.append("rect")
				.attr("width",300).attr("height", 180)
				.attr("fill","#d8d8d8")
				.attr("ry",10).attr("rx",10);
				
	var vtt = vtg.append("text").text(function(){
						var c = retrievecity(name);
						var n = name;
						var y = '';
						if(year == "2012"){
							y = '(Predicted ' + year + ')';
						}else{
							y = '(' + year + ')';
						}
						return c + ' ' + n + ' ' + y + '';
					})
					.attr("style","font-family:'LeagueGothicRegular'; font-size:26px; font-style:normal;")
					.attr("fill","#444444").attr("y",35).attr("x",10);
	
	var text_labels = Array();
	var stat_values = Array();
	
	var p_roll = cleanNum( teams[ name ][ year ]["payroll"] );
	var p_diff = cleanNum( teams[ name ][ year ]["difference--of-payroll--to-avg"] );
	
	text_labels.push( "Payroll:" );
	stat_values.push( '$' + ( p_roll / 1000000 ).toFixed(2) + ' million' );
	
	text_labels.push( "Diff from AVG Payroll:" );
	stat_values.push( '$' + ( p_diff / 1000000 ).toFixed(2) + ' million' );
	
	if(year != "2012"){
		text_labels.push( "Wins:" );
		stat_values.push( parseInt(teams[ name ][ year ]["#-of-wins"]) + ' games' );
	}else{
		text_labels.push( "Predicted:" );
		stat_values.push( parseInt(teams[ name ][ year ]["theoretical-2012-based-on-%-pre-error"]) + ' games' );
	}
	if(year != "2012"){
		text_labels.push( "Dollars per win:" );
		stat_values.push( '$' + (cleanNum( teams[ name ][ year ]["$-per-win"] ) / 1000000).toFixed(2) + ' million' );
	}else{
		text_labels.push( "% change from avg payroll:" );
		stat_values.push( teams[ name ][ year ]["%-change--from-avg-payroll"] );
	}
	
	var infos = vtg.selectAll(".indi_team_info").data( text_labels )
					.enter().append("g").attr("class","indi_team_info")
					.attr("transform",function(d,i){
						var xpos = 10;
						var ypos = 65 + ( i * 30 );
						return "translate(" + xpos + "," + ypos + ")";
					});
					
	
	infos.append("text").text(function(d,i){
			return text_labels[i];
		}).attr("style","font-family:'BlueHighwayRegular'; font-size:16px; font-style:normal;")
		.attr("fill","#888888").append("tspan").text(function(d,i){
			return stat_values[i];
		}).attr("style","font-family:'BlueHighwayRegular'; font-size:16px; font-style:normal;")
		.attr("dy",0).attr("dx",10).attr("fill","#444444");
	
	vtg.transition().duration(400)
			.attr("opacity",1.0);
	
}

function dropDownTeam(){
	
	var ddg = d3.select("#vis").selectAll("svg").append("g")
		.attr("class", "dropdown").attr("transform","translate(200,60)")
		.attr("opacity",1.0);
	
	var ddtg = ddg.selectAll(".team_option").data( teamnames ).enter()
		.append("g").attr("class","team_option")
		.attr("transform",function(d,i){
			var column = i %  10;
			var row    = Math.floor( i / 10 );
			var ypos = row * 52;
			var xpos = column * 52;
			return "translate("+xpos+","+ypos+")";
		})
		.on("click",function(d){
			initbubble( d );
		})
		.on("mouseover",function(d,i){
			d3.select(this).transition().duration(300)
				.attr("opacity",1.0);
			d3.selectAll(".team_option").each(function(d,ind){
				if( i != ind){
					d3.select(this).transition().duration(300)
						.attr("opacity",0.4);
				}
			});
		})
		.on("mouseout",function(d,i){
			d3.selectAll(".team_option").transition().duration(300)
				.attr("opacity",0.8);
		}).attr("opacity",0.0);
	
	ddtg.append("image").attr("width",50).attr("height",50)
		.attr("class","team_option_thumb")
		.attr("style","cursor:pointer")
		.attr("xlink:href",function(d){return "_imgs/_teams/" + d + ".png"; });
	
	//alert( "ZOMG" );
	ddtg.transition().duration(200).ease("bounce")
		.attr("opacity",0.8);
}




///////////////////
//HELPER FUNCTIONS
//These help get information that will help
//fill the "teams" array which will hold an 
//object for each team, with sub-objects for
//each year and one last one for the average
function getrel(name){
	var rel = -1;
	
	if( name.indexOf("2006") != -1){
		rel =  "2006";
	}
	if( name.indexOf("2007") != -1){
		rel =  "2007";
	}
	if( name.indexOf("2008") != -1){
		rel =  "2008";
	}
	if( name.indexOf("2009") != -1){
		rel =  "2009";
	}
	if( name.indexOf("2010") != -1){
		rel =  "2010";
	}
	if( name.indexOf("2011") != -1){
		rel =  "2011";
	}
	if( name.indexOf("2012") != -1){
		rel = "2012";
	}
	if( name.indexOf("AVG") != -1){
		rel = "AVG";
	}
	  
	if(rel == -1) return false;
	
	////(rel);
	  
	return rel;
}

function retrievecity(teamname){
	var city;
	
	for(var i = 0; i < cities.length; i++){
		var teams = cities[i]["teams"];
		var city  = cities[i]["name"];
		for(var j = 0; j < teams.length; j++){
			var tt = teams[j];
			if(teamname == tt){
				////(teamname + " is from " + city);
				return city;
			}
		}
	}
	
	return city;
}

function getcity(name){
	var city = '';
	if(name == '') return false;
	city = name.split('|')[0];
	city = city.replace(/-/g,' ');
	return city;
}

function getteam(name){
	
	var valid = name;
	var temp  = name;
	valid = valid.replace(/2012/g,'');
	valid = valid.replace(/2011/g,'');
	valid = valid.replace(/2010/g,'');
	valid = valid.replace(/2009/g,'');
	valid = valid.replace(/2008/g,'');
	valid = valid.replace(/2007/g,'');
	valid = valid.replace(/2006/g,'');
	valid = valid.replace(/AVG/g,'');
	valid = valid.replace(/-/g,'');
	
	var e = (valid.indexOf('|')) + 1;
	valid = valid.substr(e);
	
	if(valid == '') return false;
	return valid;
}

function descent( arr ){
	var f =  arr.sort(arr);
	return f.reverse();
}

function sortTeams( type, req_relationship ){
	
	var rv = Array();
	
	if(req_relationship == "2012"){
		if(type != "payroll"){
			type = "theoretical-2012-based-on-%-pre-error";
		}
	}
	
	for(var w = 0; w < teamnames.length; w++){
		rv[w] = teamnames[w];
	}
	//start by getting all the data for this type of filter
	var fdata = Array();
	for(var i = 0; i < teamnames.length; i++ )
	{
		var tname = teamnames[i];
		var unclean = teams[ tname ][ req_relationship ][ type ];
		var tdata = parseInt( unclean.replace(/,/g,'') );
		fdata[i] = tdata ;
	}
	
	var i, j, minIndex, tmp;
    var n = fdata.length;
    for (i = 0; i < n - 1; i++) {
		minIndex = i;
		for (j = i + 1; j < n; j++){
			if (fdata[j] > fdata[minIndex]){
				minIndex = j;
			}
		}
        if (minIndex != i) {
			tmp  = fdata[i];
			fdata[i] = fdata[minIndex];
			fdata[minIndex] = tmp;
			
			tmpn         = rv[i];
			rv[i]        = rv[minIndex];
			rv[minIndex] = tmpn;
        }
	}

	return rv;
}

function cleanNum( num ){
	return parseInt( num.replace(/,/g,'') );
}

function retreiveDivision( name ){
	var div = "none";
	
	for(var i = 0; i < divisions.length; i++){
		var tdiv   = divisions[i];
		var tteams = tdiv["teams"];
		for(var j = 0; j < tteams.length; j++){
			var tt = tteams[j];
			if(name == tt){
				//console.log( tdiv["name"] );
				return tdiv["name"];
			}
		}
	}
	//console.log( name );
	return div;
}

function checkLeftovers(){
	//console.log( d3.selectAll(".sliding_amount_value") );
	//console.log( d3.selectAll(".hover_marker") );
	max_timeout += 10;
	if( max_timeout < 800){
		d3.selectAll(".sliding_amount_value").attr("opacity",0.0).remove();
		d3.selectAll(".hover_marker").attr("opacity",0.0).remove();
		setTimeout(function(){ checkLeftovers(); }, 10);
	}
	else{
		max_timeout = 0;
	}
}

function divisionIndex( year ){

	var indx = 0;
	
	switch(year){
		case "2006":
			indx = 0;
			break;
		case "2007":
			indx = 1;
			break;
		case "2008":
			indx = 2;
			break;
		case "2009":
			indx = 3;
			break;
		case "2010":
			indx = 4;
			break;
		case "2011":
			indx = 5;
			break;
		default:
			break;
	}
	
	return indx;
}


function isdivisionwinner( name, year ){
	var winner = false;
	
	if(year == "AVG" || year == "2012"){
		return false;
	}
	
	var indx = 0;
	switch(year){
		case "2006":
			indx = 0;
			break;
		case "2007":
			indx = 1;
			break;
		case "2008":
			indx = 2;
			break;
		case "2009":
			indx = 3;
			break;
		case "2010":
			indx = 4;
			break;
		case "2011":
			indx = 5;
			break;
		default:
			break;
	}
	for(var i = 0; i < divisions.length; i++)
	{
		var td  = divisions[i];
		var tdw = td["winners"];
		//console.log( year + ' ' + td["name"] + ' ' + tdw[indx] );
		if( name == tdw[indx] ){
			return td["name"];
		}
	}
	
	return winner;
}

function isWorldSeriesWinner( name, year ){
	var winner = false;
	
	if( worldseries[year] == name){
		return true;
	}
	
	return winner;
}

function isWildCardWinner( name, year ){
	var winner = false;
	
	if( year == "AVG" || year == "2012" ){
		return false;
	}
	var year_winners = wildcards[year];
	for(var i = 0; i < year_winners.length; i++){
		if(year_winners[i] == name){
			return true;
		}
	}
	//console.log ( year_winners );
	
	return winner;
}

function teamsnameswithspaces( name ){
	var temp = name;
	
	var first = '';
	var last  = '';
	if(name.search("Sox")){
		var spacetoadd = name.search("Sox");
		for( var q = 0; q < spacetoadd; q++ ){
			first += temp[q];
		}
		for( var w = spacetoadd; w < temp.length; w++){
			last += temp[w];
		}
	}
	
	temp = first + ' ' + last;
	return temp;
}











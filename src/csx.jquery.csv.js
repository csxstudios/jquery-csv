(function ($) {
	$.fn.jqueryCsv = function (options) {
		// default settings:
		var defaults = {
			headerKeywordsAllowed: [],
			headerConversions: {},
			processData: function(csvText) {
				var allTextLines = csvText.split(/\r\n|\n|\r/);
				var headers = allTextLines[0].split(',');
				var lines = [];

				//convert headers
				headers.forEach(function(value, index) {
					headers[index] = settings.parseHeaders(value.trim().replace(/\"(.*)\"/, "$1"), index);
				})		

				//csv text to objects
				for (var i=1; i<allTextLines.length; i++) {
					var parseData = allTextLines[i].trim().split(/((?:"(?:"{2}|,|\n|[^"]*)+")|(?:[^,"\n]+))/);
					var data = [];
					parseData.forEach(function(value, index) {
						if (index % 2) {
							data.push(parseData[index]);
						}
					})
					
					if (data.length == headers.length) {

						var tarr = {};
						for (var j=0; j<headers.length; j++) {
							//trim extra double quotes and whitespace
							var parseValue = data[j].replace(/\"(.*)\"/, "$1").trim();
							//numbers only
							var numTest = parseValue.replace(/[^0-9.-]+/g,"");
							//coordinates
							var coordTest = parseValue.match(/([-+]?\d*\.\d{3}\d*)/gi);
							
							//evaluate if number or coordinates
							if(!isNaN(numTest) && numTest !== "") {
								newValue = parseInt(numTest);
							} else if (coordTest) {
								coordTest.forEach(function(value,index) {
									coordTest[index] = parseFloat(coordTest[index]);
								})
								newValue = coordTest;
							} else {
								newValue = parseValue;
							}

							if(!settings.headerKeywordsAllowed.length || settings.headerKeywordsAllowed.includes(headers[j])) {
								tarr[headers[j]] = newValue;
							}
						}
						
						lines.push(tarr);
					}
				}

				return lines;

			},
			parseHeaders: function(header, i) {
				var headerArr = header.split(" ");
				var matchedArr = [];
				if(settings.headerKeywordsAllowed.length) {
					headerArr.forEach(function(value, index) {
						var match = settings.headerKeywordsAllowed.some(function (keyword) {
							return value.toUpperCase().includes(keyword)
						});
						
						if (match) {
							var convertedText = value.toUpperCase() in settings.headerConversions ? settings.headerConversions[value.toUpperCase()] : value.toUpperCase();
							matchedArr.push(convertedText);
						} else {
							header += "A" + i;
						}
					})
				}
				
				return matchedArr.length > 0 ? matchedArr[matchedArr.length-1] : header.split(" ").join("");
			}
		};

		var settings = $.extend({}, defaults, options);

		return this.each(function () {
			var elem = $(this);

			const update = function (elem) {
				var csvText = elem.val() ? elem.val().toString() : elem.text();
				var parent = elem.parent();
				var dataArr = settings.processData(csvText);
				var parseText = JSON.stringify(dataArr);

				var output = $("#csvToJson").length ? $("#csvToJson").text(parseText) : $("<code id='csvToJson' />").text(parseText).appendTo(parent);
			};

			update(elem);

			$(this).on("keyup", function () {
			console.log("update");
			update(elem);
			});
		
		});
	};

})(jQuery);

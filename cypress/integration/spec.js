/*global describe, it, cy*/

const URL = "http://127.0.0.1:8080/index.html";

/**
 * Move to a specific search results page
 * @param {int} pageNumber
 */
var goToPage = function (pageNumber) {
	if (pageNumber != 1)
		for (var i = 2; i <= pageNumber; i++) {
			cy.get('.page-number').contains(i).click();
		}
	cy.log('On page ' + pageNumber);
}

/**
 * Open the metadata editor for a Survey by its index in the page
 * @param {int} index 
 */
var selectResult = function (index) {
	cy.get("table[data-role='results'] tbody > tr").eq(index - 1).find('button').click();
}

/**
 * Refresh metadata of a single survey by its page and index
 * @param {int} pageNumber 
 * @param {int} index 
 */
var touchMetadata = function (pageNumber, index) {
	goToPage(pageNumber);
	selectResult(index);

	// Save
	cy.wait(10000).then(function () {
		cy.get('button[data-role=save]').click();
		cy.wait('@save').then(function (xhr) {
			cy.wait(1000);
			cy.go('back');
		});
	});
}

// var checkIndex = function (index) {
// 	var totResults = 10;
// 	// var totResults = Cypress.$("table[data-role='results'] tbody > tr").length;
// 	cy.log('Found results', totResults)
// 	return totResults > index;
// }

/**
 * Refresh metadata of all surveys
 * @param {int} totPages 
 * @param {int} maxSurveysPerPage 
 */
var touchAllMetadata = function (totPages, maxSurveysPerPage) {

	var first = true;
	for (var page = 9; page <= totPages; page++) {
		for (var survey = 1; survey <= maxSurveysPerPage; survey++) {
			cy.log('index', survey);
			if (!first) {
				cy.wait('@metadata');
				cy.wait(1800);
			} else {
				first = false;
			}

			touchMetadata(page, survey);
		}
	}
}

describe('Auto-magic compilation', function () {
	it('Touch all Metadata', function () {

		const MAX_SURVEY_PER_PAGE = 10;

		cy.server()
		cy.route('POST', '/d3s/msd/codes/*').as('codes');
		cy.route('GET', '/d3s/msd/choices/*').as('choices');
		cy.route('POST', '/d3s/msd/resources/*').as('metadata');
		cy.route('PUT', '/d3s/msd/resources/metadata').as('save');

		cy.visit(URL);
		cy.get('#btnSearch').click();

		cy.wait('@metadata').then(function (xhr) {
			cy.get('li.page-last a').then($a => {
				// Find out last Metadata page number
				var totPages = parseInt($a[0].innerHTML);
				cy.log('Last page: ' + totPages);

				touchAllMetadata(totPages, MAX_SURVEY_PER_PAGE);
			});
		});
	})
});
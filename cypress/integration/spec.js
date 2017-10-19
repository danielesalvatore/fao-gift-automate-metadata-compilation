/*global describe, it, cy*/

describe('Auto-magic compilation', function() {

  it('Login against FAO CAF', function() {
  	
		cy.visit("ttp://127.0.0.1/:8080/index.html");

		cy.get('#btnSearch').click();
		//cy.contains('HI').click();

      	cy.go('back')

  })

   
});
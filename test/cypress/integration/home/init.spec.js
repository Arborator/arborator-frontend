import * as ctx from  '../../../../quasar.conf.js'


describe('Landing', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('.should() - assert that <title> is correct', () => {
    cy.title().should('include', 'arborator')
  })
  it('check access treebank button', () => {
    cy.get('#accesstreebank').click();
    cy.url().should('include', '/projects');
    cy.get('#createproject').click();
    cy.get('#createprojectform input').first().type('iamaproject');
    cy.get('#createprojectform input:eq( 1 )').type('iamadescription');
    cy.get('#submitproject').click();
  })
  it('check test project manipulation', () => {
    cy.get('#accesstreebank').click();
    cy.contains('test').first().click();
    cy.url().should('include', '/projects/test');
    cy.contains('open_in_browser').first().click();
    cy.get('#sc0').contains('person').click();
    cy.get('svg:eq( 0 )').get('text.UPOS:eq(0)').click();
    cy.get('#catselect').click();
    cy.get('div.q-item:eq(0)').click();
    cy.get('#catselectvalidate').click();
    cy.get('svg:eq( 0 )').get('text.UPOS:eq(0)').should('contain', 'ADJ');
  })
})

// describe('Home page tests', () => {
//   beforeEach(() => {
//     cy.visit('/');
//   });
//   it('has pretty background', () => {
//     cy.get('.landing-wrapper')
//       .should('have.css', 'background').and('match', /(".+(\/img\/background).+\.png)/);
//   });
//   it('has pretty logo', () => {
//     cy.get('.landing-wrapper img')
//       .should('have.class', 'logo-main')
//       .and('have.attr', 'src')
//       .and('match', /^(data:image\/svg\+xml).+/);
//   });
//   it('has very important information', () => {
//     cy.get('.instruction-wrapper')
//       .should('contain', 'SETUP INSTRUCTIONS')
//       .and('contain', 'Configure Authentication')
//       .and('contain', 'Database Configuration and CRUD operations')
//       .and('contain', 'Continuous Integration & Continuous Deployment CI/CD');
//   });
// });

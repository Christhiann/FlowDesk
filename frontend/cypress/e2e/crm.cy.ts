describe('CRM flow', () => {
  it('loads the CRM page and opens a customer detail', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@flowdesk.com');
    cy.get('input[type="password"]').type('Senha@123');
    cy.contains('button', 'Entrar').click();
    cy.url().should('include', '/dashboard');

    cy.contains('a', 'CRM').click();
    cy.url().should('include', '/dashboard/crm');

    cy.contains('h1', 'CRM').should('exist');
    cy.contains('a', 'Ver detalhes').first().click();

    cy.contains('h1', /./).should('exist');
    cy.contains('Contatos').should('exist');
    cy.contains('Vendas').should('exist');
    cy.contains('Interações').should('exist');
  });
});

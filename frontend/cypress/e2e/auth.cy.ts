describe('Auth flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully and redirect to dashboard', () => {
    cy.get('input[type="email"]').type('employee@flowdesk.com');
    cy.get('input[type="password"]').type('Senha@123');
    cy.contains('button', 'Entrar').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show an error on invalid password', () => {
    cy.get('input[type="email"]').type('employee@flowdesk.com');
    cy.get('input[type="password"]').type('SenhaIncorreta');
    cy.contains('button', 'Entrar').click();
    cy.contains('Credenciais inválidas').should('exist');
  });

  it('should logout and redirect to login', () => {
    cy.get('input[type="email"]').type('employee@flowdesk.com');
    cy.get('input[type="password"]').type('Senha@123');
    cy.contains('button', 'Entrar').click();
    cy.url().should('include', '/dashboard');
    cy.contains('button', 'Sair').click();
    cy.url().should('include', '/login');
  });
});

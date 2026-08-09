describe('Kanban board', () => {
  it('creates a new task and moves it between columns', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('manager@flowdesk.com');
    cy.get('input[type="password"]').type('Senha@123');
    cy.contains('button', 'Entrar').click();
    cy.url().should('include', '/dashboard');

    cy.contains('a', 'Tarefas').click();
    cy.url().should('include', '/dashboard/tasks');

    cy.contains('+ Nova tarefa').click();
    cy.get('input[required]').type('Tarefa de teste Cypress');
    cy.contains('button', 'Criar tarefa').click();

    cy.contains('Tarefa de teste Cypress').should('exist');

    cy.contains('A fazer').closest('div').parent().within(() => {
      cy.contains('Tarefa de teste Cypress').should('exist');
    });

    const dataTransfer = new DataTransfer();
    cy.contains('Tarefa de teste Cypress').scrollIntoView().trigger('dragstart', {
      dataTransfer,
      force: true,
    });

    cy.contains('Em andamento')
      .closest('div')
      .parent()
      .scrollIntoView()
      .trigger('dragover', { dataTransfer, force: true })
      .trigger('drop', { dataTransfer, force: true });

    cy.contains('Em andamento')
      .closest('div')
      .parent()
      .within(() => {
        cy.contains('Tarefa de teste Cypress').should('exist');
      });
  });
});

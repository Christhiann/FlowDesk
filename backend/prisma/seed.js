const { PrismaClient, Role, TaskStatus, Priority, InteractionType, SaleStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const now = new Date();
const today = new Date(now);

today.setHours(12, 0, 0, 0);

function monthsAgo(months) {
  const date = new Date(today);
  date.setMonth(date.getMonth() - months);
  return date;
}

async function main() {
  const password = await bcrypt.hash('Senha@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@flowdesk.com' },
    update: {},
    create: {
      name: 'Admin FlowDesk',
      email: 'admin@flowdesk.com',
      password,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@flowdesk.com' },
    update: {},
    create: {
      name: 'Gerente FlowDesk',
      email: 'manager@flowdesk.com',
      password,
      role: Role.MANAGER,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@flowdesk.com' },
    update: {},
    create: {
      name: 'Colaborador FlowDesk',
      email: 'employee@flowdesk.com',
      password,
      role: Role.EMPLOYEE,
    },
  });

  const customers = [
    {
      name: 'Taurus Serviços',
      email: 'contato@taurus.com.br',
      phone: '+55 11 99999-1111',
      company: 'Taurus Serviços Ltda',
      createdById: manager.id,
    },
    {
      name: 'LabTech Inovação',
      email: 'vendas@labtech.com.br',
      phone: '+55 21 98888-2222',
      company: 'LabTech Inovação S/A',
      createdById: admin.id,
    },
    {
      name: 'Mercado Fácil',
      email: 'comercial@mercadofacil.com.br',
      phone: '+55 31 97777-3333',
      company: 'Mercado Fácil E-commerce',
      createdById: manager.id,
    },
  ];

  for (const customerData of customers) {
    await prisma.customer.upsert({
      where: { email: customerData.email },
      update: customerData,
      create: customerData,
    });
  }

  const taurus = await prisma.customer.findUnique({ where: { email: 'contato@taurus.com.br' } });
  const labtech = await prisma.customer.findUnique({ where: { email: 'vendas@labtech.com.br' } });
  const mercado = await prisma.customer.findUnique({ where: { email: 'comercial@mercadofacil.com.br' } });

  if (!taurus || !labtech || !mercado) {
    throw new Error('Falha ao criar clientes de seed');
  }

  const contacts = [
    {
      name: 'Ana Souza',
      email: 'ana.souza@taurus.com.br',
      phone: '+55 11 99999-1112',
      customerId: taurus.id,
    },
    {
      name: 'Bruno Lima',
      email: 'bruno.lima@labtech.com.br',
      phone: '+55 21 98888-2223',
      customerId: labtech.id,
    },
    {
      name: 'Carla Mendes',
      email: 'carla.mendes@mercadofacil.com.br',
      phone: '+55 31 97777-3334',
      customerId: mercado.id,
    },
  ];

  for (const contact of contacts) {
    const existingContact = await prisma.contact.findFirst({ where: { email: contact.email } });
    if (!existingContact) {
      await prisma.contact.create({ data: contact });
    }
  }

  const interactions = [
    {
      type: InteractionType.EMAIL,
      note: 'Envio de proposta inicial e apresentação do portfólio de serviços.',
      occurredAt: monthsAgo(5),
      customerId: taurus.id,
      createdById: manager.id,
    },
    {
      type: InteractionType.CALL,
      note: 'Ligação com o cliente para esclarecer dúvidas sobre o fluxo de implantação.',
      occurredAt: monthsAgo(4),
      customerId: labtech.id,
      createdById: admin.id,
    },
    {
      type: InteractionType.MEETING,
      note: 'Reunião de negociação para ajustar escopo e prazos da integração.',
      occurredAt: monthsAgo(3),
      customerId: mercado.id,
      createdById: manager.id,
    },
    {
      type: InteractionType.NOTE,
      note: 'Cliente pediu follow-up mensal; validar ROI após 30 dias de uso.',
      occurredAt: monthsAgo(2),
      customerId: mercado.id,
      createdById: employee.id,
    },
  ];

  for (const interaction of interactions) {
    await prisma.interaction.create({ data: interaction });
  }

  const sales = [
    {
      title: 'Implementação de CRM personalizado',
      amount: 12500,
      status: SaleStatus.WON,
      customerId: taurus.id,
      createdById: manager.id,
      createdAt: monthsAgo(5),
      updatedAt: monthsAgo(5),
    },
    {
      title: 'Consultoria de automação de marketing',
      amount: 9800,
      status: SaleStatus.QUALIFIED,
      customerId: labtech.id,
      createdById: admin.id,
      createdAt: monthsAgo(4),
      updatedAt: monthsAgo(4),
    },
    {
      title: 'Plataforma de vendas omnichannel',
      amount: 18400,
      status: SaleStatus.NEGOTIATION,
      customerId: mercado.id,
      createdById: manager.id,
      createdAt: monthsAgo(2),
      updatedAt: monthsAgo(2),
    },
    {
      title: 'Pacote de suporte trimestral',
      amount: 4200,
      status: SaleStatus.PROSPECT,
      customerId: mercado.id,
      createdById: employee.id,
      createdAt: monthsAgo(1),
      updatedAt: monthsAgo(1),
    },
  ];

  for (const sale of sales) {
    const existingSale = await prisma.sale.findFirst({ where: { title: sale.title } });
    if (!existingSale) {
      await prisma.sale.create({ data: sale });
    }
  }

  await prisma.task.createMany({
    data: [
      {
        title: 'Configurar ambiente do projeto',
        description: 'Instalar dependências e subir containers com Docker Compose',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        assigneeId: employee.id,
        createdById: admin.id,
      },
      {
        title: 'Modelar schema do Prisma',
        description: 'Definir entidades User e Task com enums de papel e status',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        assigneeId: manager.id,
        createdById: admin.id,
      },
      {
        title: 'Criar board Kanban no frontend',
        description: 'Colunas To Do / Em andamento / Revisão / Concluído com drag and drop',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        assigneeId: employee.id,
        createdById: manager.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed concluído. Usuários de teste:');
  console.log('  admin@flowdesk.com / manager@flowdesk.com / employee@flowdesk.com');
  console.log('  senha para todos: Senha@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

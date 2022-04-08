const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  "167291953966-5bg4t1k036roducjrdanvvtb6oh716e2.apps.googleusercontent.com",
  "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",
  "http://localhost"
);

oAuth2Client.setCredentials({
  "access_token": "ya29.A0ARrdaM8ZUh-If6CJHhP-jBX7ePCb_q1MSU_gRwdqqg1u3Z6mHHP3tOJVjIOj9Ghx8dikmkACLnwWDo9HN_WjlwHDyMx9zbIP8S7o772lr-s6n71WsALVeD7VnoE2JfAzWSXGcEI2SlfBnH8u3YhuLM45XmAR",
  "refresh_token": "1//0h4CzbIuDJQYrCgYIARAAGBESNwF-L9IrIHWhbGrRcW3QS95qFuld7WABjB0_gw4o5AP8wK2jchBLSBJL9YwqxVGHpsuHDwsmfiw",
  "scope": "https://www.googleapis.com/auth/spreadsheets",
  "token_type": "Bearer",
  "expiry_date": 1649304366510
});
const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

async function read() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '1TsY5aAqGqvUkx8Y6NSn_iJ7pBprBNYvrjse7RLSUxr0',
    range: 'Productos!A2:E',
  });

  const rows = response.data.values;
  const products = rows.map((row) => ({
    id: +row[0],
    name: row[1],
    price: +row[2],
    image: row[3],
    stock: +row[4],
  }));

  return products;
}


async function write(products) {
  let values = products.map(p => [p.id, p.name, p.price, p.image, p.stock])
  const resource = {
    values,
  };
  const result = await sheets.spreadsheets.values.update({
    spreadsheetId: "1TsY5aAqGqvUkx8Y6NSn_iJ7pBprBNYvrjse7RLSUxr0",
    range: "Productos!A2:E",
    valueInputOption: "RAW",
    resource,
  });
}

async function writeOrders(orders) {
  let values = orders.map((order) => [
    order.date,
    order.preferenceId,
    order.shipping.name,
    order.shipping.email,
    JSON.stringify(order.items),
    JSON.stringify(order.shipping),
    order.status,
  ]);

  const resource = {
    values,
  };
  const result = await sheets.spreadsheets.values.update({
    spreadsheetId: "1KnZ0jXcwV15uTqcMBczLhClnuDmmTrXheJ9VLl_oSLQ",
    range: "Pedidos!A2:G",
    valueInputOption: "RAW",
    resource,
  });
}

async function readOrders() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "1KnZ0jXcwV15uTqcMBczLhClnuDmmTrXheJ9VLl_oSLQ",
    range: "Pedidos!A2:G",
  });

  const rows = response.data.values;
  const orders = rows.map((row) => ({
    date: row[0],
    preferenceId: row[1],
    name: row[2],
    email: row[3],
    items: JSON.parse(row[4]),
    shipping: JSON.parse(row[5]),
    status: row[6],
  }));

  return orders;
}

async function updateOrderByPreferenceId(preferenceId, status) {
  const orders = await readOrders();
  const order = orders.find(o => o.preferenceId === preferenceId)
  order.status = status;
  await writeOrders(orders);
}


module.exports = {
  read,
  write,
  writeOrders,
  updateOrderByPreferenceId,
  readOrders,
};


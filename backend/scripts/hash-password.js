const bcrypt = require('bcryptjs');

const password = 'e2e-test-password';
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);
console.log('Password:', password);
console.log('Hash:', hash);

// ハッシュの検証
const isValid = bcrypt.compareSync(password, hash);
console.log('Validation:', isValid);
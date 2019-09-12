const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
// const key = crypto.randomBytes(32);
const key = Buffer.from(process.env.REMINDER_ENCRYPT_SECRET);
const iv = crypto.randomBytes(16);

exports.hasPermission = (user, permissionsNeeded) => {
  if (!user || !user.roles) return false;
  const matchedPermissions = user.roles.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  return matchedPermissions.length;
};

exports.encrypt = text => {
  try {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
  } catch (error) {
    return '';
  }
};

exports.decrypt = text => {
  try {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return '';
  }
};

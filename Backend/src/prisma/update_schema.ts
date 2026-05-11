import * as fs from 'fs';
import * as path from 'path';

const schemaPath = 'd:/USERS/vaishnavi/Desktop/CRM Pro/Backend/src/prisma/schema.prisma';
let content = fs.readFileSync(schemaPath, 'utf8');

const userModelRegex = /model User \{([\s\S]+?)\}/;
const match = content.match(userModelRegex);

if (match) {
  let userContent = match[1];
  if (!userContent.includes('region')) {
    userContent = userContent.replace(
      'status    UserStatus @default(ACTIVE)',
      'status    UserStatus @default(ACTIVE)\n  region    Region?'
    );
    content = content.replace(userModelRegex, `model User {${userContent}}`);
    fs.writeFileSync(schemaPath, content);
    console.log('Updated schema.prisma');
  } else {
    console.log('Region already exists in User model');
  }
} else {
  console.log('User model not found');
}

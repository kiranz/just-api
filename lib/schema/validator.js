import { validate as validateSchema } from 'jsonschema';
import fs from 'fs';

export function validateJSONSchema(dataObject, schemaFilePath) {
    const expectedSchema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));

    return validateSchema(dataObject, expectedSchema);
}
export function getBlankObject(schema) {
    let keys = {};

    let schema_keys = schema.keys || schema.properties;

    for (let key in schema_keys) {
        let value = schema_keys[key];
        let type = value.type;

        if (type === 'list')
            type = 'array';
        else if (type === 'dict')
            type = 'object';

        if (type === 'array')
            keys[key] = getBlankArray(value);
        else if (type === 'object')
            keys[key] = getBlankObject(value);
        else if (type === 'string')
            keys[key] = '';
        else if (schema.type === 'number')
            return '';
    }

    return keys;
}


export function getBlankArray(schema) {
    let items = [];
    let type = schema.items.type;

    if (type === 'list')
        type = 'array';
    else if (type === 'dict')
        type = 'object';

    if (type === 'array')
        items.push(getBlankArray(schema.items))
    else if (type === 'object')
        items.push(getBlankObject(schema.items));
    else if (type === 'string')
        items.push('');
    else if (schema.type === 'number')
        items.push('');

    return items;
}


export function getBlankData(schema) {
    let type = schema.type;

    if (type === 'list')
        type = 'array';
    else if (type === 'dict')
        type = 'object';

    if (type === 'array') {
        return getBlankArray(schema);
    }
    else if (type === 'object') {
        return getBlankObject(schema);
    } else if (type === 'string') {
        return '';
    } else if (type === 'number') {
        return '';
    }
}



function getSyncedArray(data, schema) {
    let newData = JSON.parse(JSON.stringify(data));

    let type = schema.items.type;
    
    if (type === 'list')
        type = 'array';
    else if (type === 'dict')
        type = 'object';

    for (let i = 0; i < data.length; i++) {
        let item = data[i];

        if (type === 'array') {
            newData[i] = getSyncedArray(item, schema.items);
        } else if (type === 'object') {
            newData[i] = getSyncedObject(item, schema.items);
        }
    }

    return newData;
}


function getSyncedObject(data, schema) {
    let newData = JSON.parse(JSON.stringify(data));

    let schema_keys = schema.keys || schema.properties;

    let keys = [...Object.keys(schema_keys)];

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let schemaValue = schema_keys[key];
        let type = schemaValue.type;
    
        if (type === 'list')
            type = 'array';
        else if (type === 'dict')
            type = 'object';
      
        if (!data.hasOwnProperty(key)) {
            if (type === 'string')
                newData[key] = '';
            else if (type === 'array')
                newData[key] = getSyncedArray([], schemaValue);
            else if (type === 'object')
                newData[key] = getSyncedObject({}, schemaValue);
        } else {
        if (type === 'string')
                newData[key] = data[key];
            else if (type === 'array')
                newData[key] = getSyncedArray(data[key], schemaValue);
            else if (type === 'object')
                newData[key] = getSyncedObject(data[key], schemaValue);
        }
        
    }

    return newData;
}


export function getSyncedData(data, schema) {
    // adds those keys to data which are in schema but not in data

    let type = schema.type;
    
    if (type === 'list')
        type = 'array';
    else if (type === 'dict')
        type = 'object';

    if (type === 'array') {
        return getSyncedArray(data, schema);
    } else if (type === 'object') {
        return getSyncedObject(data, schema);
    }

    return data;
}

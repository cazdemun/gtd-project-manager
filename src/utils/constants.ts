// https://www.regular-expressions.info/conditional.html
// https://stackoverflow.com/questions/39222950/regular-expression-with-if-condition
// - A project always starts with a title, which is a line starting with a hyphen.
// - We capture everything lazily until we finish the ID. 
// - If there is no ID, we capture until the start of the next project or the end of the file.
// TODO: Test RAW_PROJECT_REGEX with^<<END>>, since normalizePotentialResources and then a parser (RAW_PROJECT_TAGS_REGEX) will asume the file ends in a new line, which maybe is the case but IDK really.
// Example: 
// - Test
// #test
// <<END>>
// After normalize 
// Test\n#test\n<!--ID: 12345678-1234-1234-1234-123456789012--> 
// Test\n#test<!--ID: 12345678-1234-1234-1234-123456789012-->
// The latest will not be parsed correctly, since the tags regex will look from an ID in a new line.
export const RAW_PROJECT_REGEX = /^- .*?(?:(?=<!--ID: [a-f0-9-]{36}-->$)<!--ID: [a-f0-9-]{36}-->$|(?=^-|<<END>>))/gms;

export const RAW_PROJECT_UUID_REGEX = /<!--ID: ([a-f0-9-]{36})-->$/;
export const RAW_PROJECT_TITLE_REGEX = /^-.*?$/gms;
export const RAW_PROJECT_ACTIONS_REGEX = /^[ \t]+-.*?$/gms;
export const RAW_PROJECT_DESCRIPTION_REGEX = /(?:^[ \t]*-.*?\n)+(.*?)(?=^<!--ID:|^#)/gms;
export const RAW_PROJECT_TAGS_REGEX = /^#.*?(?=^<!--ID:)/gms;

export const VALID_TAG_REGEX = /^(?:[a-zA-Z]+[-])*[a-zA-Z]+$/;

// Config constants
export const CONFIG_SHOW_PAST_PROJECTS = 'CONFIG_SHOW_PAST_PROJECTS';
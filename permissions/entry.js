const { ROLE } = require("./roles");

function canViewEntry(entry, user) {
    return (entry.userId === user.id);       
}

function scopeEntries(entries, user) {
    if (user.role === "admin") return entries;
    return entries.filter(entry => entry.userId === user.id);
}

module.exports = {
    canViewEntry,
    scopeEntries
}
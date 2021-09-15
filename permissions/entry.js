function canViewEntry(entry, user) {
    return (entry.userId === user.id);       
}

function scopeEntries(entries, user) {
    if (user.role === "admin") return entries;
    return entries.filter(
        entry => entry.userId === user.id ||
        entry.tag === "public"
    );
}

module.exports = {
    canViewEntry,
    scopeEntries
}
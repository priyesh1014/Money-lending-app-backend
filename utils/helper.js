function calculateAge(dateOfBirth) {
    const difference = Date.now() - dateOfBirth.getTime();
    const ageDt = new Date(difference);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
}
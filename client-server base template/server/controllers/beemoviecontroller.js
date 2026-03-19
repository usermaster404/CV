exports.getBeeChaos = (req, res) => {
  const sizeMB = parseInt(req.query.size) || 5; // default 5MB
  const targetSize = sizeMB * 1024 * 1024;

  let script = "";
  const paragraph = `
  According to all known laws of backend engineering,
  there is no way a bee should be able to deploy to production.
  Its wings are too small to carry that much technical debt.
  The bee, however, ignores stack traces because bees don't care
  what humans think is impossible.
  \n
  `;

  while (script.length < targetSize) {
    script += paragraph;
  }

  res.setHeader("Content-Type", "text/plain");
  res.send(script);
};

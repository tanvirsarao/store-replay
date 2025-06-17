const params = {
  Bucket: BUCKET,
  Key: `${sessionId}.json`,
  Body: JSON.stringify(events),
  ContentType: 'application/json',
};

s3.upload(params, (err, data) => {
  if (err) {
    console.error('❌ S3 Upload Error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
  console.log(`✅ Session stored in S3: ${data.Location}`);
  res.status(200).json({ message: 'Session saved' });
});

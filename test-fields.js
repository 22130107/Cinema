// Test API to check for year and rating fields
async function testMovieFields() {
  try {
    const res = await fetch('https://ophim1.com/v1/api/home');
    const json = await res.json();
    
    if (json.status === 'success' && json.data.items.length > 0) {
      const movie = json.data.items[0];
      console.log('Movie fields:');
      console.log('  name:', movie.name);
      console.log('  year:', movie.year);
      console.log('  modified:', movie.modified);
      console.log('  created:', movie.created);
      console.log('  clapAmount:', movie.clapAmount);
      console.log('  viewCount:', movie.viewCount);
      console.log('  voteAverage:', movie.voteAverage);
      console.log('  imdbId:', movie.imdbId);
      console.log('  slug:', movie.slug);
      
      console.log('\nFull first movie:');
      console.log(JSON.stringify(movie, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testMovieFields();

// Test more API endpoints
async function testMoreEndpoints() {
  try {
    console.log('Testing different endpoints...\n');
    
    // Test danh-sach/phim-moi
    console.log('1. /v1/api/danh-sach/phim-moi?page=1');
    const res1 = await fetch('https://ophim1.com/v1/api/danh-sach/phim-moi?page=1');
    const json1 = await res1.json();
    console.log(`   Items: ${json1.data.items.length}`);
    console.log(`   Total Pages: ${json1.data.params.pagination.totalPages}`);
    console.log(`   Total Items: ${json1.data.params.pagination.totalItems}`);
    
    // Test danh-sach/phim-chieu-rap
    console.log('\n2. /v1/api/danh-sach/phim-bo?page=1');
    const res2 = await fetch('https://ophim1.com/v1/api/danh-sach/phim-bo?page=1');
    const json2 = await res2.json();
    console.log(`   Items: ${json2.data.items.length}`);
    console.log(`   Total Pages: ${json2.data.params.pagination.totalPages}`);
    console.log(`   Total Items: ${json2.data.params.pagination.totalItems}`);
    
    // Test the-loai/hanh-dong (Action)
    console.log('\n3. /v1/api/the-loai/hanh-dong?page=1');
    const res3 = await fetch('https://ophim1.com/v1/api/the-loai/hanh-dong?page=1');
    const json3 = await res3.json();
    console.log(`   Items: ${json3.data.items.length}`);
    console.log(`   Total Pages: ${json3.data.params.pagination.totalPages}`);
    console.log(`   Total Items: ${json3.data.params.pagination.totalItems}`);
    
    // Test quoc-gia/au-my
    console.log('\n4. /v1/api/quoc-gia/au-my?page=1');
    const res4 = await fetch('https://ophim1.com/v1/api/quoc-gia/au-my?page=1');
    const json4 = await res4.json();
    console.log(`   Items: ${json4.data.items.length}`);
    console.log(`   Total Pages: ${json4.data.params.pagination.totalPages}`);
    console.log(`   Total Items: ${json4.data.params.pagination.totalItems}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testMoreEndpoints();

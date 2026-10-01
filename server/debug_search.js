import 'dotenv/config';
import cloudinary from './config/cloudinary.js';

// Test 1: Search ALL images in imagify folder (no tag filter)
console.log('--- Test 1: All imagify images ---');
try {
    const result1 = await cloudinary.search
        .expression('folder:imagify/*')
        .sort_by('created_at', 'desc')
        .max_results(5)
        .with_field('tags')
        .execute();
    console.log('Total found:', result1.total_count);
    result1.resources?.forEach(r => {
        console.log(`  ${r.public_id} | folder: ${r.asset_folder} | tags: ${JSON.stringify(r.tags)} | created: ${r.created_at}`);
    });
} catch(e) { console.log('Error:', e.message); }

// Test 2: Search by resource_type only 
console.log('\n--- Test 2: All images in account ---');
try {
    const result2 = await cloudinary.search
        .expression('resource_type:image')
        .sort_by('created_at', 'desc')
        .max_results(5)
        .with_field('tags')
        .execute();
    console.log('Total found:', result2.total_count);
    result2.resources?.forEach(r => {
        console.log(`  ${r.public_id} | folder: ${r.asset_folder || r.folder} | tags: ${JSON.stringify(r.tags)} | created: ${r.created_at}`);
    });
} catch(e) { console.log('Error:', e.message); }

// Test 3: Search by folder prefix
console.log('\n--- Test 3: folder:imagify ---');
try {
    const result3 = await cloudinary.search
        .expression('folder:imagify')
        .sort_by('created_at', 'desc')
        .max_results(5)
        .with_field('tags')
        .execute();
    console.log('Total found:', result3.total_count);
    result3.resources?.forEach(r => {
        console.log(`  ${r.public_id} | folder: ${r.asset_folder || r.folder} | tags: ${JSON.stringify(r.tags)}`);
    });
} catch(e) { console.log('Error:', e.message); }
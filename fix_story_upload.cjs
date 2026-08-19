const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                            <label className="block text-xs text-gray-400 mb-1 font-semibold">
                              {isArabic ? "رابط الصورة (Unsplash أو غيره)" : "Image URL"}
                            </label>
                            <input
                              type="text"
                              value={newStoryMedia}
                              onChange={(e) => setNewStoryMedia(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full bg-[#1A1A1A] border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                            />
                            <div className="flex gap-1.5 mt-1.5">
                              <button
                                onClick={() => setNewStoryMedia("https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600")}
                                className="text-[9px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300"
                              >
                                {isArabic ? "مثال صورة أنمي ١" : "Anime Ex 1"}
                              </button>
                              <button
                                onClick={() => setNewStoryMedia("https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600")}
                                className="text-[9px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300"
                              >
                                {isArabic ? "مثال صورة أنمي ٢" : "Anime Ex 2"}
                              </button>
                            </div>`;

const replacement = `                            <label className="block text-xs text-gray-400 mb-1 font-semibold">
                              {isArabic ? "رفع صورة القصة" : "Upload Story Image"}
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const { compressImage } = await import('./utils/imageUtils');
                                    const base64 = await compressImage(file, 800);
                                    setNewStoryMedia(base64);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className="w-full bg-[#1A1A1A] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer"
                            />
                            {newStoryMedia && (
                              <div className="mt-2 rounded-lg overflow-hidden h-24 bg-black border border-zinc-800">
                                <img src={newStoryMedia} className="w-full h-full object-cover opacity-80" alt="Preview" />
                              </div>
                            )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);

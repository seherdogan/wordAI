import React from 'react';

interface MarketplaceProps {
  onOpenDocument: (docId: string, title: string) => void;
  onCreateNew: () => void;
}

const ProductCard: React.FC<{ 
  title: string; 
  category: string; 
  price: string; 
  image: string; 
  rating: number;
  isNew?: boolean;
  onClick: () => void;
}> = ({ title, category, price, image, rating, isNew, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-card-hover hover:border-brand/30 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
  >
    {isNew && (
      <span className="absolute top-3 left-3 bg-brand text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">
        YENİ
      </span>
    )}
    {/* Product Image Area */}
    <div className="h-48 bg-gray-100 relative overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </div>

    {/* Product Details */}
    <div className="p-4 flex flex-col flex-1">
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{category}</span>
        <div className="flex items-center gap-0.5 text-yellow-400">
          <span className="material-symbols-rounded text-[14px] fill-current">star</span>
          <span className="text-xs font-bold text-gray-500 ml-1">{rating}</span>
        </div>
      </div>
      <h3 className="font-display font-bold text-lg text-dark mb-1 leading-tight group-hover:text-brand transition-colors">{title}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 mb-4">AI destekli otomatik düzenleme modu ile hemen başlayın.</p>
      
      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm font-bold text-dark">{price}</span>
        <button className="text-brand font-bold text-xs uppercase tracking-wide hover:underline flex items-center gap-1">
            Düzenle <span className="material-symbols-rounded text-sm">edit</span>
        </button>
      </div>
    </div>
  </div>
);

const Marketplace: React.FC<MarketplaceProps> = ({ onOpenDocument, onCreateNew }) => {
  return (
    <div className="flex-1 bg-light overflow-y-auto custom-scrollbar">
      {/* Hero Banner */}
      <div className="w-full bg-dark text-white py-12 px-4 md:px-8 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand to-transparent opacity-20"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand rounded-full blur-[80px] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
                <span className="bg-white/10 text-brand-light text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block border border-white/10">YAPAY ZEKA DESTEKLİ</span>
                <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 leading-tight">İçerik üretiminin yeni yolu.</h1>
                <p className="text-gray-400 text-lg mb-8">Serah AI, taslaklarınızı profesyonel belgelere dönüştürür.</p>
                <button 
                    onClick={onCreateNew}
                    className="bg-brand hover:bg-brand-dark text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-brand/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <span className="material-symbols-rounded">add</span>
                    YENİ BELGE OLUŞTUR
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl text-dark">Belgelerim</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard 
                title="Q3 Pazarlama Stratejisi" 
                category="Kurumsal" 
                price="1.2k Kelime" 
                image="https://picsum.photos/400/300?random=1"
                rating={4.8}
                isNew={true}
                onClick={() => onOpenDocument("1", "Q3 Pazarlama Stratejisi")}
            />
            <ProductCard 
                title="Blog Yazısı Taslağı" 
                category="İçerik Üretimi" 
                price="Taslak" 
                image="https://picsum.photos/400/300?random=2"
                rating={4.5}
                onClick={() => onOpenDocument("2", "Blog Yazısı Taslağı")}
            />
            <ProductCard 
                title="Yatırımcı Sunum Metni" 
                category="Finans" 
                price="850 Kelime" 
                image="https://picsum.photos/400/300?random=3"
                rating={4.9}
                onClick={() => onOpenDocument("3", "Yatırımcı Sunum Metni")}
            />
            <ProductCard 
                title="Kullanıcı Sözleşmesi v2" 
                category="Hukuk" 
                price="3.5k Kelime" 
                image="https://picsum.photos/400/300?random=4"
                rating={4.2}
                onClick={() => onOpenDocument("4", "Kullanıcı Sözleşmesi v2")}
            />
        </div>

        {/* Second Row Header */}
        <div className="flex items-center justify-between mt-12 mb-6">
            <h2 className="font-display font-bold text-2xl text-dark">Popüler Şablonlar</h2>
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => onOpenDocument("5", "E-Kitap Şablonu")} className="group cursor-pointer rounded-2xl bg-white border border-gray-200 p-6 hover:border-brand transition-colors flex gap-4 items-center relative overflow-hidden">
                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-rounded text-4xl">book</span>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-dark group-hover:text-brand transition-colors">E-Kitap Şablonu</h3>
                    <p className="text-xs text-gray-500">24 Sayfa • Modern Tasarım</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-50 p-2 rounded-full group-hover:bg-brand group-hover:text-white transition-colors">
                    <span className="material-symbols-rounded">arrow_forward</span>
                </div>
            </div>

            <div onClick={() => onOpenDocument("6", "CV Hazırlayıcı")} className="group cursor-pointer rounded-2xl bg-white border border-gray-200 p-6 hover:border-brand transition-colors flex gap-4 items-center relative overflow-hidden">
                <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-rounded text-4xl">person</span>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-dark group-hover:text-brand transition-colors">CV Hazırlayıcı</h3>
                    <p className="text-xs text-gray-500">ATS Uyumlu • Profesyonel</p>
                </div>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-50 p-2 rounded-full group-hover:bg-brand group-hover:text-white transition-colors">
                    <span className="material-symbols-rounded">arrow_forward</span>
                </div>
            </div>

            <div onClick={() => onOpenDocument("7", "Haftalık Rapor")} className="group cursor-pointer rounded-2xl bg-white border border-gray-200 p-6 hover:border-brand transition-colors flex gap-4 items-center relative overflow-hidden">
                <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-rounded text-4xl">monitoring</span>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-dark group-hover:text-brand transition-colors">Haftalık Rapor</h3>
                    <p className="text-xs text-gray-500">Otomatik Özet • Grafikler</p>
                </div>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-50 p-2 rounded-full group-hover:bg-brand group-hover:text-white transition-colors">
                    <span className="material-symbols-rounded">arrow_forward</span>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Marketplace;
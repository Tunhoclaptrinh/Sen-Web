import artifactService from "@/services/artifact.service";
import heritageService from "@/services/heritage.service";
import { message } from "antd";

// Import local images for reliability
import bronzeDrumImg from "@/assets/images/background/bronze-drum.png";
import lotusImg from "@/assets/images/background/lotus-1.png";
import senHoaCumImg from "@/assets/images/background/senhoacum.png";
import backgroundFullImg from "@/assets/images/background/background-full.png";

const demoArtifacts = [
  {
    name: "Trống Đồng Đông Sơn",
    artifactType: "Trống đồng",
    description: "Trống đồng Đông Sơn là tiêu biểu cho Văn hóa Đông Sơn (700 TCN - 100) của người Việt cổ. Những chiếc trống này được dùng trong các nghi lễ nông nghiệp, lễ hội mùa màng và cả trong chiến tranh.",
    shortDescription: "Biểu tượng văn hóa rực rỡ của nền văn minh lúa nước, thể hiện trình độ đúc đồng điêu luyện.",
    historicalContext: "Thời kỳ văn hóa Đông Sơn, giai đoạn cực thịnh của thời đại đồ đồng tại Việt Nam.",
    culturalSignificance: "Biểu tượng của quyền lực và tâm linh, phản ánh đời sống sinh hoạt phong phú của người Việt cổ.",
    material: "Đồng thau",
    dimensions: "Đường kính 90cm, cao 60cm",
    condition: "Tốt",
    yearCreated: "700 TCN",
    dynasty: "Văn Lang",
    images: [bronzeDrumImg],
    mainImage: bronzeDrumImg,
    rating: 5,
    totalReviews: 120,
    viewCount: 5000,
    isOnDisplay: true
  },
  {
    name: "Ấn Vàng Sắc Mệnh Chi Bảo",
    artifactType: "Ấn triện",
    description: "Ấn vàng 'Sắc Mệnh Chi Bảo' được đúc vào năm Minh Mạng thứ 8 (1827), dùng để đóng trên các văn bản sắc phong, chiếu chỉ quan trọng của triều đình.",
    shortDescription: "Bảo vật quốc gia, biểu trưng cho quyền lực tối thượng của Hoàng đế triều Nguyễn.",
    historicalContext: "Triều Nguyễn, giai đoạn vua Minh Mạng trị vì.",
    culturalSignificance: "Minh chứng cho nghệ thuật kim hoàn đỉnh cao và thể chế chính trị quân chủ.",
    material: "Vàng ròng",
    dimensions: "14cm x 14cm",
    condition: "Nguyên vẹn",
    yearCreated: "1827",
    dynasty: "Nhà Nguyễn",
    images: [lotusImg],
    mainImage: lotusImg,
    rating: 4.8,
    totalReviews: 85,
    viewCount: 3200,
    isOnDisplay: true
  },
   {
    name: "Tượng Phật A Di Đà chùa Phật Tích",
    artifactType: "Tượng điêu khắc",
    description: "Kiệt tác điêu khắc đá thời Lý, hiện lưu giữ tại chùa Phật Tích, Bắc Ninh. Tượng thể hiện vẻ đẹp từ bi, thanh thoát của Đức Phật.",
    shortDescription: "Kiệt tác điêu khắc đá thời Lý, bảo vật quốc gia với giá trị nghệ thuật độc đáo.",
    historicalContext: "Thời Lý, kỷ nguyên hưng thịnh của Phật giáo Việt Nam.",
    culturalSignificance: "Đỉnh cao của nghệ thuật điêu khắc đá Đại Việt.",
    material: "Đá xanh",
    dimensions: "Cao 1.86m",
    condition: "Khá tốt",
    yearCreated: "1057",
    dynasty: "Nhà Lý",
    images: [senHoaCumImg],
    mainImage: senHoaCumImg,
    rating: 4.9,
    totalReviews: 200,
    viewCount: 4500,
    isOnDisplay: true
  }
];

const demoHeritageSites = [
  {
    name: "Hoàng Thành Thăng Long",
    type: "monument",
     description: `
        <p><strong>Hoàng thành Thăng Long</strong> là quần thể di tích gắn liền với lịch sử kinh thành Thăng Long - Đông Kinh và tỉnh thành Hà Nội bắt đầu từ thời kì tiền Thăng Long (An Nam đô hộ phủ thế kỷ VII) qua thời Đinh - Tiền Lê, phát triển mạnh dưới thời Lý, Trần, Lê và thành Hà Nội dưới triều Nguyễn.</p>
        
        <h3>Giá trị lịch sử đặc biệt</h3>
        <p>Đây là công trình kiến trúc đồ sộ, được các triều vua xây dựng trong nhiều giai đoạn lịch sử và trở thành di tích quan trọng bậc nhất trong hệ thống các di tích Việt Nam.</p>
        
        <p>Vào lúc 20 giờ 30 ngày 31/7/2010 theo giờ địa phương tại Brasil, tức 6 giờ 30 ngày 1/8/2010 theo giờ Việt Nam, Ủy ban di sản thế giới của UNESCO đã thông qua nghị quyết công nhận khu Trung tâm Hoàng thành Thăng Long - Hà Nội là di sản văn hóa thế giới.</p>
     `,
    shortDescription: "Di sản văn hóa thế giới, trung tâm quyền lực chính trị liên tục trong hơn 13 thế kỷ.",
    region: "Miền Bắc",
    address: "19C Hoàng Diệu, Ba Đình, Hà Nội",
    yearEstablished: 1010,
    visitHours: "8:00 - 17:00",
    entranceFee: 30000,
    unescoListed: true,
    images: [backgroundFullImg],
    mainImage: backgroundFullImg,
    rating: 4.7,
    totalReviews: 1500,
    viewCount: 12000
  },
   {
    name: "Phố Cổ Hội An",
    type: "historic_building",
    description: `
        <p><strong>Đô thị cổ Hội An</strong> là một kiểu cảng thị truyền thống Đông Nam Á duy nhất ở Việt Nam, hiếm có trên thế giới, giữ được gần như nguyên vẹn hơn một nghìn di tích kiến trúc như phố xá, nhà cửa, hội quán, đình, chùa, miếu, nhà thờ tộc, giếng cổ...</p>
        
        <h3>Kiến trúc độc đáo</h3>
        <p>Kiến trúc Hội An là sự giao thoa tài tình của văn hóa Việt với các nước phương Đông (Nhật Bản, Trung Hoa) và phương Tây. Những ngôi nhà ở đây thường có kết cấu khung gỗ, mái lợp ngói âm dương, tường vôi vàng đặc trưng.</p>
        
        <p>Hội An còn nổi tiếng với những lễ hội truyền thống, văn hóa ẩm thực phong phú và sự hiếu khách của người dân.</p>
    `,
    shortDescription: "Thương cảng sầm uất thế kỷ 16-17, nơi giao thoa văn hóa Đông - Tây quyến rũ.",
    region: "Miền Trung",
    address: "Hội An, Quảng Nam",
    yearEstablished: 1600,
    visitHours: "Cả ngày",
    entranceFee: 80000,
    unescoListed: true,
    images: [senHoaCumImg],
    mainImage: senHoaCumImg,
    rating: 4.9,
    totalReviews: 3000,
    viewCount: 25000
  },
  {
      name: "Cố Đô Huế",
      type: "monument",
      description: `
        <p><strong>Quần thể di tích Cố đô Huế</strong> là những di tích lịch sử - văn hóa do triều Nguyễn chủ trương xây dựng trong khoảng thời gian từ đầu thế kỷ 19 đến nửa đầu thế kỷ 20 trên địa bàn kinh đô Huế xưa.</p>
        
        <h3>Vẻ đẹp cung đình trầm mặc</h3>
        <p>Nổi bật nhất là Kinh thành Huế với ba vòng thành: Kinh thành, Hoàng thành và Tử cấm thành. Bên cạnh đó là hệ thống lăng tẩm các vua Nguyễn với kiến trúc phong thủy độc đáo, hòa quyện với thiên nhiên.</p>
        
        <p>Nhã nhạc cung đình Huế cũng là một di sản văn hóa phi vật thể được UNESCO công nhận, góp phần làm nên bản sắc văn hóa đặc biệt của vùng đất Cố đô.</p>
      `,
      shortDescription: "Kinh đô cuối cùng của các triều đại phong kiến Việt Nam với kiến trúc cung đình tráng lệ.",
      region: "Miền Trung",
      address: "Thành phố Huế, Thừa Thiên Huế",
      yearEstablished: 1802, 
      visitHours: "7:00 - 17:30",
      entranceFee: 200000,
      unescoListed: true,
       images: [lotusImg],
       mainImage: lotusImg,
     rating: 4.8,
    totalReviews: 2200,
     viewCount: 18000
  }
];

export const seedData = async () => {
  try {
     message.loading("Seeding data...", 0);
    
    // Seed Artifacts
    for (const art of demoArtifacts) {
       try {
           // Search for existing artifact by name
           const searchRes = await artifactService.getAll({ q: art.name });
           const existing = searchRes.data && searchRes.data.find(a => a.name === art.name);

           if (existing) {
               console.log(`Updating existing artifact: ${art.name}`);
               await artifactService.update(existing.id, art as any);
           } else {
               console.log(`Creating new artifact: ${art.name}`);
               await artifactService.create(art as any);
           }
       } catch (err) {
           console.error(`Error processing artifact ${art.name}:`, err);
       }
    }

    // Seed Heritage
    for (const site of demoHeritageSites) {
        try {
            // Search for existing site by name
            const searchRes = await heritageService.getAll({ q: site.name });
            const existing = searchRes.data && searchRes.data.find(s => s.name === site.name);
            
            if (existing) {
                console.log(`Updating existing heritage site: ${site.name}`);
                await heritageService.update(existing.id, site as any);
            } else {
                 console.log(`Creating new heritage site: ${site.name}`);
                await heritageService.create(site as any);
            }
        } catch (err) {
            console.error(`Error processing heritage site ${site.name}:`, err);
        }
    }
    
    message.destroy();
    message.success("Demo data updated/seeded successfully! Refreshing...");
    
    // Reload page
    setTimeout(() => window.location.reload(), 1500);

  } catch (error) {
      message.destroy();
      message.error("Failed to seed data.");
      console.error(error);
  }
};

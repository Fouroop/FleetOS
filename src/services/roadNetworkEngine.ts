/**
 * High-Precision Road Network Corridors & Trajectory Interpolation Engine
 * Aligns simulated and historic vehicle trajectories accurately with real highway / arterial road alignments.
 */

export interface RoadWaypoint {
  lat: number;
  lng: number;
  roadName: string;
  speedLimitKmH: number;
  district?: string;
  isBridgeOrTunnel?: boolean;
}

export interface RoadCorridor {
  id: string;
  name: string;
  city: string;
  totalLengthKm: number;
  waypoints: RoadWaypoint[];
}

/**
 * Dense, accurate road network corridors aligned with real expressway alignments in China
 */
export const ROAD_CORRIDORS: Record<string, RoadCorridor> = {
  // Corridor 1: 深圳 坂田 -> 龙岗 -> 盐田港保税区 (G25长深高速 / 水官高速 / 盐排高速)
  'corridor-shenzhen': {
    id: 'corridor-shenzhen',
    name: '深圳坂田智造-水官高速-盐田港国际货运走廊',
    city: '深圳',
    totalLengthKm: 38.5,
    waypoints: [
      { lat: 22.6572, lng: 114.0628, roadName: '坂雪岗大道华为基地4号门', speedLimitKmH: 50, district: '龙岗区' },
      { lat: 22.6515, lng: 114.0650, roadName: '坂雪岗大道与贝尔路立交', speedLimitKmH: 60, district: '龙岗区' },
      { lat: 22.6432, lng: 114.0725, roadName: '吉华路水官高速入口引桥', speedLimitKmH: 60, district: '龙岗区' },
      { lat: 22.6375, lng: 114.0810, roadName: 'S28水官高速 布吉收费站', speedLimitKmH: 80, district: '龙岗区' },
      { lat: 22.6310, lng: 114.0935, roadName: 'S28水官高速 李朗立交主线', speedLimitKmH: 100, district: '龙岗区' },
      { lat: 22.6248, lng: 114.1082, roadName: 'S28水官高速 平沙立交东向', speedLimitKmH: 100, district: '龙岗区' },
      { lat: 22.6180, lng: 114.1245, roadName: 'S28水官高速 丹平立交枢纽', speedLimitKmH: 100, district: '龙岗区' },
      { lat: 22.6112, lng: 114.1390, roadName: 'S28水官高速 横岗主线收费站', speedLimitKmH: 90, district: '龙岗区' },
      { lat: 22.6025, lng: 114.1550, roadName: 'S30盐排高速 互通立交A匝道', speedLimitKmH: 80, district: '龙岗区' },
      { lat: 22.5930, lng: 114.1720, roadName: 'S30盐排高速 梧桐山特长隧道北口', speedLimitKmH: 80, isBridgeOrTunnel: true, district: '盐田区' },
      { lat: 22.5845, lng: 114.1905, roadName: 'S30盐排高速 梧桐山特长隧道中段', speedLimitKmH: 80, isBridgeOrTunnel: true, district: '盐田区' },
      { lat: 22.5760, lng: 114.2080, roadName: 'S30盐排高速 梧桐山隧道南出洞口', speedLimitKmH: 80, isBridgeOrTunnel: true, district: '盐田区' },
      { lat: 22.5695, lng: 114.2235, roadName: 'G15沈海高速/盐田主线收费站', speedLimitKmH: 70, district: '盐田区' },
      { lat: 22.5640, lng: 114.2388, roadName: '深盐路 盐田港后方陆域物流通道', speedLimitKmH: 60, district: '盐田区' },
      { lat: 22.5720, lng: 114.2540, roadName: '盐田港保税区 进港专用货运大道', speedLimitKmH: 50, district: '盐田区' },
      { lat: 22.5837, lng: 114.2694, roadName: '盐田港现代国际物流保税中心装卸台', speedLimitKmH: 30, district: '盐田区' },
    ]
  },

  // Corridor 2: 上海 虹桥枢纽 -> 延安高架 -> S20外环 -> G2京沪高速 -> 昆山 -> 苏州工业园
  'corridor-shanghai-suzhou': {
    id: 'corridor-shanghai-suzhou',
    name: '上海虹桥-延安高架-G2京沪高速-昆山-苏州园区冷链大动脉',
    city: '上海/苏州',
    totalLengthKm: 85.0,
    waypoints: [
      { lat: 31.2304, lng: 121.4737, roadName: '上海市人民广场/延安东路立交', speedLimitKmH: 60, district: '黄浦区' },
      { lat: 31.2260, lng: 121.4550, roadName: '延安中路高架桥 茂名路下匝道段', speedLimitKmH: 80, district: '静安区' },
      { lat: 31.2185, lng: 121.4280, roadName: '延安西路高架桥 江苏路段', speedLimitKmH: 80, district: '长宁区' },
      { lat: 31.2050, lng: 121.3850, roadName: '延安高架延伸段 虹桥枢纽立交', speedLimitKmH: 80, district: '闵行区' },
      { lat: 31.2280, lng: 121.3520, roadName: 'S20上海外环高速 华江路段', speedLimitKmH: 90, district: '嘉定区' },
      { lat: 31.2650, lng: 121.3120, roadName: 'G2京沪高速 江桥收费站主线', speedLimitKmH: 100, district: '嘉定区' },
      { lat: 31.3120, lng: 121.2250, roadName: 'G2京沪高速 安亭汽车城互通', speedLimitKmH: 110, district: '嘉定区' },
      { lat: 31.3480, lng: 121.1200, roadName: 'G2京沪高速 昆山陆家收费站', speedLimitKmH: 110, district: '昆山市' },
      { lat: 31.3820, lng: 120.9850, roadName: 'G2京沪高速 昆山中环高架枢纽', speedLimitKmH: 110, district: '昆山市' },
      { lat: 31.3750, lng: 120.8520, roadName: 'G2京沪高速 唯亭枢纽立交', speedLimitKmH: 100, district: '苏州工业园区' },
      { lat: 31.3320, lng: 120.7350, roadName: '苏州工业园区 星湖街北段', speedLimitKmH: 60, district: '苏州工业园区' },
      { lat: 31.2989, lng: 120.7335, roadName: '苏州工业园区 中新大道与星湖街交汇中心', speedLimitKmH: 50, district: '苏州工业园区' },
    ]
  },

  // Corridor 3: 北京 大兴国际机场 -> 京台高速G3 -> 廊坊 -> 天津武清化工基地
  'corridor-beijing-tianjin': {
    id: 'corridor-beijing-tianjin',
    name: '北京东四环-京台高速G3-廊坊-天津武清危化品专运线',
    city: '北京/天津',
    totalLengthKm: 78.0,
    waypoints: [
      { lat: 39.9042, lng: 116.4074, roadName: '北京建国门桥东长安街辅道', speedLimitKmH: 50, district: '东城区' },
      { lat: 39.8820, lng: 116.4420, roadName: '东二环 光明桥立交向南', speedLimitKmH: 60, district: '东城区' },
      { lat: 39.8450, lng: 116.4750, roadName: '东四环 十八里店南桥枢纽', speedLimitKmH: 80, district: '朝阳区' },
      { lat: 39.7820, lng: 116.4950, roadName: 'S15京津高速 台湖主线收费站', speedLimitKmH: 90, district: '通州区' },
      { lat: 39.7150, lng: 116.5450, roadName: 'S15京津高速 于家务立交段', speedLimitKmH: 100, district: '通州区' },
      { lat: 39.6350, lng: 116.6800, roadName: 'S15京津高速 采育东立交段', speedLimitKmH: 100, district: '大兴区' },
      { lat: 39.5450, lng: 116.8200, roadName: 'S15京津高速 廊坊开发区互通', speedLimitKmH: 100, district: '廊坊市' },
      { lat: 39.4350, lng: 116.8920, roadName: 'G2502天津外环绕城高速 武清西段', speedLimitKmH: 90, district: '武清区' },
      { lat: 39.3820, lng: 116.9850, roadName: '天津武清特种危化品现代仓储转运中心', speedLimitKmH: 40, district: '武清区' },
    ]
  },

  // Corridor 4: 苏州 同城绿色城配专线 (金鸡湖大道 - 独墅湖隧道 - 吴中区)
  'corridor-suzhou-city': {
    id: 'corridor-suzhou-city',
    name: '苏州工业园区-独墅湖大道-金鸡湖城配纯电快运线',
    city: '苏州',
    totalLengthKm: 26.0,
    waypoints: [
      { lat: 31.2989, lng: 120.7335, roadName: '星湖街与中新大道交汇处快运仓', speedLimitKmH: 50, district: '工业园区' },
      { lat: 31.2850, lng: 120.7250, roadName: '金鸡湖大道 国际科技园南门段', speedLimitKmH: 60, district: '工业园区' },
      { lat: 31.2720, lng: 120.7350, roadName: '独墅湖大道高架桥 纳米城出入口', speedLimitKmH: 80, district: '工业园区' },
      { lat: 31.2610, lng: 120.6650, roadName: '独墅湖特长湖底隧道西入口', speedLimitKmH: 70, isBridgeOrTunnel: true, district: '吴中区' },
      { lat: 31.2550, lng: 120.6850, roadName: '独墅湖特长湖底隧道中段', speedLimitKmH: 70, isBridgeOrTunnel: true, district: '吴中区' },
      { lat: 31.2480, lng: 120.7150, roadName: '东方大道 吴中现代综合物流园', speedLimitKmH: 50, district: '吴中区' },
      { lat: 31.2650, lng: 120.7320, roadName: '松涛街 独墅湖科教创新区配送站', speedLimitKmH: 45, district: '工业园区' },
      { lat: 31.2989, lng: 120.7335, roadName: '星湖街与中新大道交汇处快运仓', speedLimitKmH: 50, district: '工业园区' },
    ]
  },

  // Corridor 5: 杭州 钱塘新区 -> 钱塘快速路 -> 秋石高架 -> 萧山智慧建工港
  'corridor-hangzhou': {
    id: 'corridor-hangzhou',
    name: '钱塘工程重载线 (钱塘快速路-秋石高架-萧山新城建工港)',
    city: '杭州',
    totalLengthKm: 36.0,
    waypoints: [
      { lat: 30.2741, lng: 120.1551, roadName: '杭州西湖环城西路建工集散点', speedLimitKmH: 45, district: '西湖区' },
      { lat: 30.2850, lng: 120.1820, roadName: '文晖路 钱塘快速路高架匝道段', speedLimitKmH: 70, district: '拱墅区' },
      { lat: 30.2920, lng: 120.2250, roadName: '钱塘快速路 新塘路立交段', speedLimitKmH: 80, district: '上城区' },
      { lat: 30.2850, lng: 120.2780, roadName: '钱塘快速路 彭埠互通枢纽', speedLimitKmH: 80, district: '上城区' },
      { lat: 30.2650, lng: 120.3350, roadName: '九堡大桥过江主桥段', speedLimitKmH: 80, isBridgeOrTunnel: true, district: '上城区/萧山区' },
      { lat: 30.2280, lng: 120.3580, roadName: '萧山通城高架桥 鸿达路出口', speedLimitKmH: 80, district: '萧山区' },
      { lat: 30.1850, lng: 120.3850, roadName: '萧山瓜沥特大重工建工搅拌基地', speedLimitKmH: 35, district: '萧山区' },
    ]
  },

  // Corridor 6: 青岛 前湾保税港 -> 胶州湾跨海大桥 -> 黄岛物流港
  'corridor-qingdao': {
    id: 'corridor-qingdao',
    name: '青岛前湾港-胶州湾跨海大桥-黄岛集装箱海铁联运干线',
    city: '青岛',
    totalLengthKm: 42.0,
    waypoints: [
      { lat: 36.0671, lng: 120.3826, roadName: '青岛市市南区香港中路货运调度总站', speedLimitKmH: 50, district: '市南区' },
      { lat: 36.1050, lng: 120.3620, roadName: '杭鞍高架路 海泊河立交段', speedLimitKmH: 70, district: '市北区' },
      { lat: 36.1480, lng: 120.3350, roadName: '环湾路 胶州湾跨海大桥环湾立交', speedLimitKmH: 80, district: '李沧区' },
      { lat: 36.1680, lng: 120.2450, roadName: 'G22青兰高速 胶州湾大桥主跨通航孔桥', speedLimitKmH: 90, isBridgeOrTunnel: true, district: '胶州湾海域' },
      { lat: 36.1450, lng: 120.1650, roadName: 'G22青兰高速 红岛枢纽互通段', speedLimitKmH: 90, district: '城阳区' },
      { lat: 36.0820, lng: 120.1950, roadName: '黄岛前湾保税港区 疏港二号高速', speedLimitKmH: 70, district: '黄岛区' },
      { lat: 36.0250, lng: 120.2280, roadName: '青岛港前湾联合国际集装箱码头', speedLimitKmH: 30, district: '黄岛区' },
    ]
  },

  // Corridor 7: 成都 双流机场 -> 绕城高速G4202 -> 龙泉驿经开区
  'corridor-chengdu': {
    id: 'corridor-chengdu',
    name: '成都双流航空港-绕城高速G4202-龙泉驿经开区干线',
    city: '成都',
    totalLengthKm: 45.0,
    waypoints: [
      { lat: 30.6586, lng: 104.0648, roadName: '成都市天府广场/人民南路干线', speedLimitKmH: 50, district: '青羊区' },
      { lat: 30.6120, lng: 104.0720, roadName: '天府大道北段 高新科创走廊', speedLimitKmH: 70, district: '武侯区' },
      { lat: 30.5550, lng: 104.0680, roadName: 'G4202成都绕城高速 天府立交桥', speedLimitKmH: 90, district: '双流区' },
      { lat: 30.5420, lng: 104.1450, roadName: 'G4202成都绕城高速 白家大桥段', speedLimitKmH: 90, district: '双流区' },
      { lat: 30.5650, lng: 104.2250, roadName: 'G4202成都绕城高速 龙泉立交段', speedLimitKmH: 90, district: '龙泉驿区' },
      { lat: 30.5980, lng: 104.2850, roadName: '成龙大道 龙泉驿汽车经开区现代制造港', speedLimitKmH: 50, district: '龙泉驿区' },
    ]
  },

  // Corridor 8: 武汉 东西湖 -> 三环线 -> 白沙洲大桥 -> 阳逻国际港
  'corridor-wuhan': {
    id: 'corridor-wuhan',
    name: '武汉东西湖保税区-三环线-白沙洲大桥-阳逻深水港大动脉',
    city: '武汉',
    totalLengthKm: 52.0,
    waypoints: [
      { lat: 30.5928, lng: 114.3055, roadName: '武汉市武昌区中北路货运集散站', speedLimitKmH: 50, district: '武昌区' },
      { lat: 30.5480, lng: 114.2820, roadName: '武汉三环线 白沙洲立交段', speedLimitKmH: 80, district: '洪山区' },
      { lat: 30.5120, lng: 114.2450, roadName: '武汉白沙洲长江大桥主跨段', speedLimitKmH: 80, isBridgeOrTunnel: true, district: '长江水域' },
      { lat: 30.5280, lng: 114.1850, roadName: '武汉三环线 汪家嘴立交枢纽', speedLimitKmH: 80, district: '汉阳区' },
      { lat: 30.6250, lng: 114.1950, roadName: '东西湖吴家山 现代铁路集装箱中心站', speedLimitKmH: 50, district: '东西湖区' },
    ]
  },

  // Corridor 9: 西安 国际港务区 -> 绕城高速 -> 沣东新城
  'corridor-xian': {
    id: 'corridor-xian',
    name: '西安国际陆港中欧班列枢纽-绕城高速-西咸新区沣东新城专线',
    city: '西安',
    totalLengthKm: 48.0,
    waypoints: [
      { lat: 34.3416, lng: 108.9398, roadName: '西安未央路龙首立交段', speedLimitKmH: 50, district: '未央区' },
      { lat: 34.3850, lng: 109.0120, roadName: 'G3002西安绕城高速 北辰立交段', speedLimitKmH: 100, district: '灞桥区' },
      { lat: 34.4120, lng: 109.0850, roadName: '西安国际港务区 中欧班列长安号装卸场', speedLimitKmH: 40, district: '港务区' },
      { lat: 34.4350, lng: 109.0200, roadName: 'G3002西安绕城高速 灞桥枢纽北段', speedLimitKmH: 100, district: '灞桥区' },
      { lat: 34.4250, lng: 108.9100, roadName: 'G3002西安绕城高速 草滩立交桥段', speedLimitKmH: 100, district: '未央区' },
      { lat: 34.3550, lng: 108.8250, roadName: 'G3002西安绕城高速 六村堡立交段', speedLimitKmH: 100, district: '未央区' },
      { lat: 34.2980, lng: 108.7850, roadName: '西咸新区沣东新城 丝路智能云仓港', speedLimitKmH: 50, district: '西咸新区' },
    ]
  },

  // Corridor 10: 厦门 翔安新城 -> 翔安海底隧道 -> 仙岳高架 -> 海沧保税港区
  'corridor-xiamen': {
    id: 'corridor-xiamen',
    name: '厦门翔安保税港-翔安海底隧道-仙岳高架-海沧国际物流园',
    city: '厦门',
    totalLengthKm: 34.0,
    waypoints: [
      { lat: 24.4798, lng: 118.0894, roadName: '厦门思明区鹭江道码头集散点', speedLimitKmH: 45, district: '思明区' },
      { lat: 24.5020, lng: 118.1150, roadName: '仙岳高架路 湖滨中路立交段', speedLimitKmH: 80, district: '思明区' },
      { lat: 24.5180, lng: 118.1680, roadName: '仙岳高架路 金尚路立交出入口', speedLimitKmH: 80, district: '湖里区' },
      { lat: 24.5320, lng: 118.2150, roadName: '翔安特长海底隧道 环岛干道西入洞口', speedLimitKmH: 80, isBridgeOrTunnel: true, district: '湖里区' },
      { lat: 24.5450, lng: 118.2480, roadName: '翔安特长海底隧道 最深海域段(-70m)', speedLimitKmH: 80, isBridgeOrTunnel: true, district: '厦门海域' },
      { lat: 24.5620, lng: 118.2820, roadName: '翔安特长海底隧道 东出洞口收费站', speedLimitKmH: 70, isBridgeOrTunnel: true, district: '翔安区' },
      { lat: 24.6150, lng: 118.3250, roadName: '翔安国际物流园区现代综合枢纽', speedLimitKmH: 40, district: '翔安区' },
    ]
  }
};

/**
 * Calculates geodesic distance between two points in km (Haversine formula)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates bearing angle (0-360 deg) from point 1 to point 2
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  if (brng < 0) brng += 360;
  return Math.round(brng);
}

/**
 * High-density Catmull-Rom & Road Spline Interpolator
 * Converts discrete road waypoints into dense, curved GPS points every 100-300 meters
 */
export function densifyRoadCorridor(corridor: RoadCorridor, targetPointIntervalKm: number = 0.25): {
  points: { lat: number; lng: number; heading: number; speedKmH: number; roadName: string; district: string }[];
  totalDistanceKm: number;
} {
  const wp = corridor.waypoints;
  if (wp.length < 2) return { points: [], totalDistanceKm: 0 };

  const densePoints: { lat: number; lng: number; heading: number; speedKmH: number; roadName: string; district: string }[] = [];
  let cumDistanceKm = 0;

  // Catmull-Rom spline helper
  const getCatmullRomPoint = (
    p0: RoadWaypoint,
    p1: RoadWaypoint,
    p2: RoadWaypoint,
    p3: RoadWaypoint,
    t: number
  ) => {
    const t2 = t * t;
    const t3 = t2 * t;

    const lat = 0.5 * (
      (2 * p1.lat) +
      (-p0.lat + p2.lat) * t +
      (2 * p0.lat - 5 * p1.lat + 4 * p2.lat - p3.lat) * t2 +
      (-p0.lat + 3 * p1.lat - 3 * p2.lat + p3.lat) * t3
    );

    const lng = 0.5 * (
      (2 * p1.lng) +
      (-p0.lng + p2.lng) * t +
      (2 * p0.lng - 5 * p1.lng + 4 * p2.lng - p3.lng) * t2 +
      (-p0.lng + 3 * p1.lng - 3 * p2.lng + p3.lng) * t3
    );

    return { lat, lng };
  };

  const rawCoords: { lat: number; lng: number; speedKmH: number; roadName: string; district: string }[] = [];

  for (let i = 0; i < wp.length - 1; i++) {
    const p1 = wp[i];
    const p2 = wp[i + 1];
    const p0 = i > 0 ? wp[i - 1] : wp[i];
    const p3 = i < wp.length - 2 ? wp[i + 2] : wp[i + 1];

    const segDist = calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
    const steps = Math.max(3, Math.ceil(segDist / targetPointIntervalKm));

    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const coord = getCatmullRomPoint(p0, p1, p2, p3, t);
      
      const baseSpeed = Math.min(p1.speedLimitKmH, p2.speedLimitKmH);
      const speedKmH = Math.round(baseSpeed * (0.92 + 0.08 * Math.sin(t * Math.PI)));

      rawCoords.push({
        lat: +coord.lat.toFixed(6),
        lng: +coord.lng.toFixed(6),
        speedKmH,
        roadName: t < 0.5 ? p1.roadName : p2.roadName,
        district: p1.district || corridor.city,
      });
    }

    cumDistanceKm += segDist;
  }

  // Add the final waypoint
  const lastWp = wp[wp.length - 1];
  rawCoords.push({
    lat: lastWp.lat,
    lng: lastWp.lng,
    speedKmH: Math.round(lastWp.speedLimitKmH * 0.5),
    roadName: lastWp.roadName,
    district: lastWp.district || corridor.city,
  });

  // Now compute precise, smooth headings along the spline path
  for (let idx = 0; idx < rawCoords.length; idx++) {
    const curr = rawCoords[idx];
    let heading = 90;

    if (idx < rawCoords.length - 1) {
      const next = rawCoords[idx + 1];
      heading = calculateBearing(curr.lat, curr.lng, next.lat, next.lng);
    } else if (idx > 0) {
      heading = densePoints[densePoints.length - 1]?.heading || 90;
    }

    densePoints.push({
      ...curr,
      heading,
    });
  }

  return { points: densePoints, totalDistanceKm: cumDistanceKm };
}

/**
 * Generate a complete, highly realistic multi-hour historical GPS track strictly adhering to road networks
 */
export function generateRealisticHistoricTrack(
  corridorKey: string = 'corridor-shenzhen',
  startTimeStr: string = '08:15:00',
  vehiclePlate: string = '粤B·9821A'
) {
  const corridor = ROAD_CORRIDORS[corridorKey] || ROAD_CORRIDORS['corridor-shenzhen'];
  const { points } = densifyRoadCorridor(corridor, 0.2); // dense 200m sampling

  const [startH, startM, startS] = startTimeStr.split(':').map(Number);
  let currentSeconds = (startH || 8) * 3600 + (startM || 15) * 60 + (startS || 0);

  return points.map((pt, idx) => {
    // Time advances according to distance and speed
    const stepSeconds = Math.max(12, Math.round((0.2 / Math.max(20, pt.speedKmH)) * 3600));
    currentSeconds += stepSeconds;

    const h = String(Math.floor(currentSeconds / 3600) % 24).padStart(2, '0');
    const m = String(Math.floor((currentSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(currentSeconds % 60).padStart(2, '0');
    const timestamp = `${h}:${m}:${s}`;

    // Add interesting events (e.g. stop at origin/destination, overspeed trigger on expressway)
    const isStart = idx === 0;
    const isEnd = idx === points.length - 1;
    const isOverspeed = idx === Math.floor(points.length * 0.65);
    const isMidStop = idx === Math.floor(points.length * 0.35);

    let speed = pt.speedKmH;
    let isStopPoint = false;
    let stopDurationMinutes = 0;
    let isAlarmPoint = false;
    let alarmText: string | undefined = undefined;

    if (isStart) {
      speed = 0;
      isStopPoint = true;
      stopDurationMinutes = 20;
    } else if (isEnd) {
      speed = 0;
      isStopPoint = true;
      stopDurationMinutes = 35;
    } else if (isMidStop) {
      speed = 0;
      isStopPoint = true;
      stopDurationMinutes = 12;
    } else if (isOverspeed) {
      speed = Math.round(pt.speedKmH * 1.25); // Trigger overspeed
      isAlarmPoint = true;
      alarmText = `超速 ${speed} km/h (限速 ${pt.speedKmH} km/h)`;
    }

    return {
      latitude: pt.lat,
      longitude: pt.lng,
      speed,
      heading: pt.heading,
      timestamp,
      address: `${corridor.city}${pt.district ? pt.district + ' · ' : ''}${pt.roadName}`,
      isStopPoint,
      stopDurationMinutes: isStopPoint ? stopDurationMinutes : undefined,
      isAlarmPoint,
      alarmText,
      altitude: Math.round(15 + Math.sin(idx * 0.2) * 18),
      fuelLevel: Math.max(10, Math.round(85 - (idx / points.length) * 22)),
      waterTemp: Math.round(84 + Math.sin(idx * 0.1) * 4),
    };
  });
}

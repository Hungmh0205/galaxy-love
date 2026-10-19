import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
  


const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 20, 30);
  
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('container').appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.45, 0.65, 0.82
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false;
controls.autoRotateSpeed = 0;
controls.enabled = false;
controls.target.set(0, 0, 0);
controls.enablePan = false;
controls.minDistance = 15;
controls.maxDistance = 300;
controls.zoomSpeed = 0.3;
controls.rotateSpeed = 0.3;  
controls.update();   
function createGlowMaterial(color, size = 128, opacity = 0.55) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture, 
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    return new THREE.Sprite(material);
}    
// Hào quang tinh cầu rực rỡ lung linh, viền ánh hồng - vàng kim sang trọng
const centralGlow = createGlowMaterial('rgba(255, 120, 210, 0.38)', 256, 0.16);
centralGlow.scale.set(26, 26, 1);
scene.add(centralGlow);

const centralGoldGlow = createGlowMaterial('rgba(255, 215, 80, 0.28)', 256, 0.14);
centralGoldGlow.scale.set(22, 22, 1);
scene.add(centralGoldGlow);

// Các dải tinh vân nền êm dịu, chiều sâu không gian huyền ảo
// Texture trắng để material.color tự đổi tông chậm theo thời gian
const cosmicHues = [320, 275, 45, 195, 290, 340];
const nebulaSprites = [];
for (let i = 0; i < 6; i++) {
    const hue = cosmicHues[i % cosmicHues.length];
    const nebula = createGlowMaterial('rgba(255, 255, 255, 0.32)', 256, 0.12);
    nebula.material.color.setHSL(hue / 360, 0.75, 0.55);
    const scale = 140 + Math.random() * 80;
    nebula.scale.set(scale, scale, 1);
    nebula.position.set(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 400
    );
    nebula.userData = {
        baseHue: hue / 360,
        phase: Math.random() * Math.PI * 2,
        speed: 0.04 + Math.random() * 0.05
    };
    nebulaSprites.push(nebula);
    scene.add(nebula);
}        
   
// ---- Táº O THIĂN HĂ€ (GALAXY) ----
const galaxyParameters = {
    count: 100000,
    arms: 6,
    radius: 100,               
    spin: 0.5, 
    randomness: 0.2,
    randomnessPower: 20,
    insideColor: new THREE.Color(0xff3399),
    outsideColor: new THREE.Color(0x40e0d0),
    rippleSpeed: 40.0,
    rippleWidth: 20.0,   
};  
    
const positions = new Float32Array(galaxyParameters.count * 3);
const colors = new Float32Array(galaxyParameters.count * 3);
let pointIdx = 0;

for (let i = 0; i < galaxyParameters.count; i++) {
    const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
    const branchAngle = (i % galaxyParameters.arms) / galaxyParameters.arms * Math.PI * 2;
    const spinAngle = radius * galaxyParameters.spin;

    const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
    const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 0.5;
    const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
    const totalAngle = branchAngle + spinAngle;

    if (radius < 30 && Math.random() < 0.7) continue;

    const i3 = pointIdx * 3;
    positions[i3] = Math.cos(totalAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(totalAngle) * radius + randomZ;

    const mixedColor = new THREE.Color(0xff2a85);
    mixedColor.lerp(new THREE.Color(0x40e0d0), radius / galaxyParameters.radius);
    mixedColor.lerp(new THREE.Color(0xffd700), Math.random() * 0.2);
    mixedColor.multiplyScalar(1.0);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    pointIdx++;
} 

const galaxyGeometry = new THREE.BufferGeometry();
galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(0, pointIdx * 3), 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors.slice(0, pointIdx * 3), 3));

const galaxyMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: 50.0 * renderer.getPixelRatio() },
        uRippleTime: { value: -1.0 },
        uRippleSpeed: { value: 40.0 },
        uRippleWidth: { value: 20.0 }
    },
    vertexShader: `
        uniform float uSize;
        uniform float uTime;
        uniform float uRippleTime;
        uniform float uRippleSpeed;
        uniform float uRippleWidth;

        varying vec3 vColor;

        void main() {
            // Láº¥y mĂ u gá»‘c tá»« geometry (giá»‘ng há»‡t vertexColors: true)
            vColor = color;

            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            // ---- LOGIC HIá»†U á»¨NG Gá»¢N SĂ“NG ----
            if (uRippleTime > 0.0) {
                float rippleRadius = (uTime - uRippleTime) * uRippleSpeed;
                float particleDist = length(modelPosition.xyz);

                float strength = 1.0 - smoothstep(0.0, uRippleWidth, abs(particleDist - rippleRadius));

                if (strength > 0.0) {
                    vColor += vec3(strength * 2.0); // LĂ m mĂ u sĂ¡ng hÆ¡n khi sĂ³ng Ä‘i qua
                }
            }

            vec4 viewPosition = viewMatrix * modelPosition;
            gl_Position = projectionMatrix * viewPosition;
            // DĂ²ng nĂ y lĂ m cho cĂ¡c háº¡t nhá» hÆ¡n khi á»Ÿ xa, mĂ´ phá»ng hĂ nh vi cá»§a PointsMaterial
            gl_PointSize = uSize / -viewPosition.z;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        void main() {
            // LĂ m cho cĂ¡c háº¡t cĂ³ hĂ¬nh trĂ²n thay vĂ¬ hĂ¬nh vuĂ´ng
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            gl_FragColor = vec4(vColor, 1.0);
        }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true
});
const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);

// ==========================================
// TỰ ĐỘNG QUÉT TOÀN BỘ ẢNH TRONG THƯ MỤC IMG/
// ==========================================
const heartPointClouds = [];
let fadeDirty = true;
let idleRotateFactor = 0;
let satelliteUpdater = null;

const fallbackImages = [
    'img/1792420414101_1903970859159966129_1903970859159966129_a732c43bd3f3bc03f910453923f02dd8.jpg',
    'img/1792420415788_1903970859159966129_1903970859159966129_4c09464a7139482c545cc29257f7dc40.jpg',
    'img/1792420417739_1903970859159966129_1903970859159966129_68a17c489f2f9a7f3fe4d647322c7153.jpg',
    'img/1792420418195_1903970859159966129_1903970859159966129_632b91d095346fcfe42ca4d0fec9a655.jpg',
    'img/1792420418946_1903970859159966129_1903970859159966129_ba6a8a794e42d35c59821079e0aae661.jpg',
    'img/1792420420003_1903970859159966129_1903970859159966129_a053a45af3a50147b85472aea5678c8f.jpg',
    'img/1792420420805_1903970859159966129_1903970859159966129_ad81ca0f37124a369a2f33331958be57.jpg',
    'img/1792422084162_644682741920816431_5686373937662559031_35534d689319a2bec7cd9fda23d52d92.jpg',
    'img/1792422084204_644682741920816431_5686373937662559031_5bd8d26d26148ae57803fb093a2f4928.jpg',
    'img/1792422084232_644682741920816431_5686373937662559031_71200aebe58d2fec69a385eecf267b0f.jpg',
    'img/1792422084258_644682741920816431_5686373937662559031_591b8765d1baf07ee09e56ee14f1cdf5.jpg',
    'img/1792422084284_644682741920816431_5686373937662559031_42d12f99cb12ef420dea21b87bc769df.jpg',
    'img/1792422084313_644682741920816431_5686373937662559031_150fe8a914d3e3fc6943287f0484bb58.jpg',
    'img/1792422084339_644682741920816431_5686373937662559031_d5d53a6b57c97a5032dab87bcce101e0.jpg',
    'img/1792422084365_644682741920816431_5686373937662559031_7301f7f23840f951971827bb36f4291e.jpg',
    'img/1792422084391_644682741920816431_5686373937662559031_0c12fb3576065740e5bd96fc2071d3d0.jpg',
    'img/1792422084417_644682741920816431_5686373937662559031_4109f3a1a64215f8a144a9f5c989bbed.jpg',
    'img/1792422084445_644682741920816431_5686373937662559031_15624281115d33f41d5156bdafc12767.jpg',
    'img/448499092_1843506989480565_5819501593650649858_n.jpg',
    'img/450484783_1163484491625332_3693830059806943646_n.jpg',
    'img/450591531_1074425737384720_1687854657834850546_n.jpg',
    'img/450775496_373828002407271_6222456238384586521_n.jpg'
];

async function scanImagesFromFolder() {
    let images = [];
    const cfg = window.dataLove2Loveloom?.data?.heartImages;
    if (Array.isArray(cfg)) {
        const cfgImages = cfg.filter(src => typeof src === 'string' && src.length > 0);
        images.push(...cfgImages);
    }
    let scanned = [];
    // 1. Quét động danh mục máy chủ local (hỗ trợ Python http.server, VSCode Live Server, Apache, Nginx...)
    try {
        const res = await fetch('img/');
        if (res.ok) {
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'))
                .map(a => a.getAttribute('href') || '')
                .filter(href => /\.(jpe?g|png|webp|gif|bmp)$/i.test(href));
            if (links.length > 0) {
                scanned = links.map(href => {
                    const clean = href.replace(/^.*[\\\/]/, '');
                    return 'img/' + clean;
                });
                console.log('Quét tự động thư mục img/ thành công, tìm thấy:', scanned.length, 'ảnh');
            }
        }
    } catch (e) {
        // Fetch trực tiếp img/ không khả dụng
    }

    if (scanned.length > 0) {
        images = images.filter(src => !/^https?:/i.test(src));
        images.push(...scanned);
    } else if (images.length === 0) {
        // 2. Tự động kiểm tra file manifest img/images.json nếu có
        try {
            const res = await fetch('img/images.json');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    images = data.map(item => item.startsWith('img/') ? item : 'img/' + item);
                    console.log('Đọc danh sách ảnh từ img/images.json, tìm thấy:', images.length, 'ảnh');
                }
            }
        } catch (e) {}

        // 3. Fallback danh sách ảnh đã chuẩn bị sẵn
        if (images.length === 0) {
            images = fallbackImages;
        }
    }

    // Loại bỏ phần tử trùng lặp
    return Array.from(new Set(images));
}

// ==========================================
// TẠO TEXTURE KHUNG HÌNH VUÔNG SANG TRỌNG
// (Tuyệt đối không dùng hình trái tim)
// ==========================================
function createNeonTexture(image, size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);

    const pad = size * 0.08;
    const innerSize = size - pad * 2;
    const cornerRadius = size * 0.06; // góc vuông bo nhẹ tinh tế

    function drawRoundRect(c, x, y, w, h, r) {
        if (c.roundRect) {
            c.beginPath();
            c.roundRect(x, y, w, h, r);
            return;
        }
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
    }

    // 1. Nền tối sâu phía sau ảnh
    ctx.save();
    ctx.fillStyle = '#0d0618';
    drawRoundRect(ctx, pad, pad, innerSize, innerSize, cornerRadius);
    ctx.fill();
    ctx.restore();

    // 2. Cắt ảnh vuông với object-fit: cover giữ trọn vẹn nét đẹp
    ctx.save();
    drawRoundRect(ctx, pad + 3, pad + 3, innerSize - 6, innerSize - 6, Math.max(2, cornerRadius - 2));
    ctx.clip();

    let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;
    if (image.width > image.height) {
        sWidth = image.height;
        sx = (image.width - image.height) / 2;
    } else if (image.height > image.width) {
        sHeight = image.width;
        sy = (image.height - image.width) / 2;
    }
    ctx.drawImage(image, sx, sy, sWidth, sHeight, pad + 3, pad + 3, innerSize - 6, innerSize - 6);
    ctx.restore();

    // 3. Khung viền vuông ánh kim rực rỡ (Gradient vàng hoàng kim - hồng sen - trắng kim cương)
    ctx.save();
    const borderGrad = ctx.createLinearGradient(pad, pad, size - pad, size - pad);
    borderGrad.addColorStop(0, '#ffd700');
    borderGrad.addColorStop(0.3, '#ffffff');
    borderGrad.addColorStop(0.7, '#ff69b4');
    borderGrad.addColorStop(1, '#ff1493');

    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = Math.max(3, size * 0.035);
    drawRoundRect(ctx, pad, pad, innerSize, innerSize, cornerRadius);
    ctx.stroke();

    // Viền trắng tinh tế bên trong
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 0;
    drawRoundRect(ctx, pad + 4, pad + 4, innerSize - 8, innerSize - 8, Math.max(1, cornerRadius - 2));
    ctx.stroke();
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

// Khởi tạo các nhóm điểm ảnh thiên hà từ ảnh quét được
async function initGalaxyPhotos() {
    const images = await scanImagesFromFolder();
    const numGroups = images.length;
    const maxDensity = 4500;
    const minDensity = 1600;
    const maxGroupsForScale = Math.max(9, numGroups);

    let pointsPerGroup;
    if (numGroups <= 1) {
        pointsPerGroup = maxDensity;
    } else if (numGroups >= maxGroupsForScale) {
        pointsPerGroup = minDensity;
    } else {
        const t = (numGroups - 1) / (maxGroupsForScale - 1);
        pointsPerGroup = Math.floor(maxDensity * (1 - t) + minDensity * t);
    }

    if (pointsPerGroup * numGroups > galaxyParameters.count) {
        pointsPerGroup = Math.floor(galaxyParameters.count / numGroups);
    }

    console.log(`Tổng số ảnh được tải: ${numGroups}, Điểm mỗi ảnh: ${pointsPerGroup}`);

    for (let group = 0; group < numGroups; group++) {
        const groupPositions = new Float32Array(pointsPerGroup * 3);
        const groupColorsNear = new Float32Array(pointsPerGroup * 3);
        const groupColorsFar = new Float32Array(pointsPerGroup * 3);
        let validPointCount = 0;

        for (let i = 0; i < pointsPerGroup; i++) {
            const idx = validPointCount * 3;
            const globalIdx = group * pointsPerGroup + i;
            const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
            if (radius < 30) continue;

            const branchAngle = (globalIdx % galaxyParameters.arms) / galaxyParameters.arms * Math.PI * 2;
            const spinAngle = radius * galaxyParameters.spin;
            const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
            const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 0.5;
            const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
            const totalAngle = branchAngle + spinAngle;

            groupPositions[idx] = Math.cos(totalAngle) * radius + randomX;
            groupPositions[idx + 1] = randomY;
            groupPositions[idx + 2] = Math.sin(totalAngle) * radius + randomZ;

            const colorNear = new THREE.Color(0xffffff);
            groupColorsNear[idx] = colorNear.r;
            groupColorsNear[idx + 1] = colorNear.g;
            groupColorsNear[idx + 2] = colorNear.b;

            const colorFar = galaxyParameters.insideColor.clone();
            colorFar.lerp(galaxyParameters.outsideColor, radius / galaxyParameters.radius);
            colorFar.multiplyScalar(0.75 + 0.25 * Math.random());
            groupColorsFar[idx] = colorFar.r;
            groupColorsFar[idx + 1] = colorFar.g;
            groupColorsFar[idx + 2] = colorFar.b;

            validPointCount++;
        }

        if (validPointCount === 0) continue;

        const groupGeometryNear = new THREE.BufferGeometry();
        groupGeometryNear.setAttribute('position', new THREE.BufferAttribute(groupPositions.slice(0, validPointCount * 3), 3));
        groupGeometryNear.setAttribute('color', new THREE.BufferAttribute(groupColorsNear.slice(0, validPointCount * 3), 3));

        const groupGeometryFar = new THREE.BufferGeometry();
        groupGeometryFar.setAttribute('position', new THREE.BufferAttribute(groupPositions.slice(0, validPointCount * 3), 3));
        groupGeometryFar.setAttribute('color', new THREE.BufferAttribute(groupColorsFar.slice(0, validPointCount * 3), 3));

        const posAttr = groupGeometryFar.getAttribute('position');
        let cx = 0, cy = 0, cz = 0;
        for (let i = 0; i < posAttr.count; i++) {
            cx += posAttr.getX(i);
            cy += posAttr.getY(i);
            cz += posAttr.getZ(i);
        }
        cx /= posAttr.count;
        cy /= posAttr.count;
        cz /= posAttr.count;
        groupGeometryNear.translate(-cx, -cy, -cz);
        groupGeometryFar.translate(-cx, -cy, -cz);

        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.src = images[group];
        img.onload = () => {
            const neonTexture = createNeonTexture(img, 256);

            const materialNear = new THREE.PointsMaterial({
                size: 4.2,
                map: neonTexture,
                transparent: true,
                alphaTest: 0.12,
                depthWrite: true,
                depthTest: true,
                blending: THREE.NormalBlending,
                vertexColors: true
            });

            const materialFar = new THREE.PointsMaterial({
                size: 3.5,
                map: neonTexture,
                transparent: true,
                alphaTest: 0.1,
                depthWrite: false,
                blending: THREE.NormalBlending,
                opacity: 0.9,
                vertexColors: true
            });

            const pointsObject = new THREE.Points(groupGeometryFar, materialFar);
            pointsObject.position.set(cx, cy, cz);

            pointsObject.userData.materialNear = materialNear;
            pointsObject.userData.geometryNear = groupGeometryNear;
            pointsObject.userData.materialFar = materialFar;
            pointsObject.userData.geometryFar = groupGeometryFar;
            pointsObject.userData.src = images[group];

            scene.add(pointsObject);
            heartPointClouds.push(pointsObject);
            fadeDirty = true;
        };
        img.onerror = () => {
            console.warn('Không tải được ảnh:', images[group]);
        };
    }
}
initGalaxyPhotos();


const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// ---- TẠO NỀN SAO 3 LỚP (PARALLAX THEO CHUỘT) ----
const starField = new THREE.Group();
starField.name = 'starfield';
scene.add(starField);

const starPalette = [
    new THREE.Color('#ffffff'), // Trắng kim cương
    new THREE.Color('#ffe6aa'), // Vàng kim ấm
    new THREE.Color('#ffb6c1'), // Hồng phấn
    new THREE.Color('#e1bee7'), // Tím ngọc
    new THREE.Color('#b3e5fc'), // Lam ngọc
    new THREE.Color('#ffd54f'), // Vàng rực
];

const starLayers = [];
const starLayerDefs = [
    { count: 6000, spread: 900, size: 2.1, depth: 1.0 },
    { count: 8000, spread: 1700, size: 1.35, depth: 0.55 },
    { count: 8000, spread: 2800, size: 0.8, depth: 0.25 }
];

starLayerDefs.forEach(def => {
    const positions = new Float32Array(def.count * 3);
    const colors = new Float32Array(def.count * 3);

    for (let i = 0; i < def.count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * def.spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * def.spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * def.spread;

        const col = starPalette[Math.floor(Math.random() * starPalette.length)];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: def.size,
        vertexColors: true,
        transparent: false,
        opacity: 1,
        depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    points.renderOrder = 999;

    const layerGroup = new THREE.Group();
    layerGroup.add(points);
    starField.add(layerGroup);
    starLayers.push({ group: layerGroup, depth: def.depth });
});

const starPointer = { x: 0, y: 0 };
window.addEventListener('pointermove', e => {
    starPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    starPointer.y = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });


// ---- Táº O SAO BÄ‚NG (SHOOTING STARS) ----
let shootingStars = [];

function createShootingStar() {
    const trailLength = 100;

    // Äáº§u sao bÄƒng
    const headGeometry = new THREE.SphereGeometry(2, 32, 32);
    const headMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);

    // HĂ o quang cá»§a sao bÄƒng
    const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            uniform float time;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * (0.8 + sin(time * 5.0) * 0.2));
            }
        `,
        transparent: true,   
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide 
    });   

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    head.add(glow); 

    // ÄuĂ´i sao bÄƒng
    const curve = createRandomCurve();
    const trailPoints = [];
    for (let i = 0; i < trailLength; i++) {
        const progress = i / (trailLength - 1);
        trailPoints.push(curve.getPoint(progress));
    }
    const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
    const trailMaterial = new THREE.LineBasicMaterial({
        color: 0x99eaff,
        transparent: true,
        opacity: 0.7,
        linewidth: 2
    });
    const trail = new THREE.Line(trailGeometry, trailMaterial);

    const shootingStarGroup = new THREE.Group();
    shootingStarGroup.add(head);
    shootingStarGroup.add(trail);
    shootingStarGroup.userData = {
        curve: curve,
        progress: 0,
        speed: 0.0005 + Math.random() * 0.0005,
        life: 0,
        maxLife: 300,
        head: head,
        trail: trail,
        trailLength: trailLength,
        trailPoints: trailPoints,
    };
    scene.add(shootingStarGroup);
    shootingStars.push(shootingStarGroup);
    fadeDirty = true;
}

function createRandomCurve() {
    const points = [];
    const startPoint = new THREE.Vector3(-200 + Math.random() * 100, -100 + Math.random() * 200, -100 + Math.random() * 200);
    const endPoint = new THREE.Vector3(600 + Math.random() * 200, startPoint.y + (-100 + Math.random() * 200), startPoint.z + (-100 + Math.random() * 200));
    const controlPoint1 = new THREE.Vector3(startPoint.x + 200 + Math.random() * 100, startPoint.y + (-50 + Math.random() * 100), startPoint.z + (-50 + Math.random() * 100));
    const controlPoint2 = new THREE.Vector3(endPoint.x - 200 + Math.random() * 100, endPoint.y + (-50 + Math.random() * 100), endPoint.z + (-50 + Math.random() * 100));

    points.push(startPoint, controlPoint1, controlPoint2, endPoint);
    return new THREE.CubicBezierCurve3(startPoint, controlPoint1, controlPoint2, endPoint);
}


// ---- Táº O HĂ€NH TINH TRUNG TĂ‚M ----

// HĂ m táº¡o texture cho hĂ nh tinh
function createPlanetTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Nền gradient chuyển sắc rực rỡ và ngọt ngào
    const gradient = ctx.createRadialGradient(size / 2, size / 2, size / 8, size / 2, size / 2, size / 2);
    gradient.addColorStop(0.0, '#fff2f8'); // hồng phấn sáng
    gradient.addColorStop(0.2, '#ffbde2'); // hồng hoa anh đào
    gradient.addColorStop(0.5, '#e066ff'); // tím violet ngọc
    gradient.addColorStop(0.8, '#9933cc'); // tím hoàng gia
    gradient.addColorStop(1.0, '#430b5c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);       
  
    // Đốm màu lung linh & ánh vàng hoàng kim
    const spotColors = ['#ffffff', '#ffd700', '#ff80bf', '#ff66b2', '#f06292', '#e1aaff', '#ffd54f', '#a259f7'];
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 25 + Math.random() * 110;
        const color = spotColors[Math.floor(Math.random() * spotColors.length)];
        const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        spotGradient.addColorStop(0, color + 'dd');
        spotGradient.addColorStop(1, color + '00');
        ctx.fillStyle = spotGradient;
        ctx.fillRect(0, 0, size, size);
    }

    // Các đường xoáy mây thiên hà mềm mại
    for (let i = 0; i < 10; i++) {          
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
        ctx.clip();     
        ctx.moveTo(Math.random() * size, Math.random() * size);
        ctx.bezierCurveTo(Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size);
        ctx.strokeStyle = (i % 2 === 0) ? 'rgba(255, 215, 0, 0.22)' : 'rgba(255, 150, 220, 0.28)';
        ctx.lineWidth = 6 + Math.random() * 16;
        ctx.stroke();
    }

    // Áp dụng blur nhẹ
    if (ctx.filter !== undefined) {
        ctx.filter = 'blur(2px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
    }

    return new THREE.CanvasTexture(canvas);
}
 
// Shader cho hiá»‡u á»©ng bĂ£o trĂªn bá» máº·t hĂ nh tinh
const stormShader = {
    uniforms: {
        time: { value: 0.0 },
        baseTexture: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform sampler2D baseTexture;
        varying vec2 vUv;
        void main() {
            vec2 uv = vUv;
            float angle = length(uv - vec2(0.5)) * 3.0;
            float twist = sin(angle * 3.0 + time) * 0.1;
            uv.x += twist * sin(time * 0.5);
            uv.y += twist * cos(time * 0.5);
            vec4 texColor = texture2D(baseTexture, uv);
            float noise = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time) * 0.1;
            vec3 shimmer = vec3(0.9, 0.45, 0.8) * noise + vec3(1.0, 0.85, 0.4) * (sin(angle * 5.0 + time * 1.2) * 0.05);
            texColor.rgb += shimmer;
            gl_FragColor = texColor;
        }
    `
};

// Táº¡o váº­t thá»ƒ hĂ nh tinh
const planetRadius = 10;
const planetGeometry = new THREE.SphereGeometry(planetRadius, 48, 48);
const planetTexture = createPlanetTexture();
const planetMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        baseTexture: { value: planetTexture }
    },
    vertexShader: stormShader.vertexShader,
    fragmentShader: stormShader.fragmentShader
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(0, 0, 0);
scene.add(planet);

// Khí quyển phát sáng lộng lẫy cho tinh cầu
const atmosphereGeometry = new THREE.SphereGeometry(planetRadius * 1.06, 48, 48);
const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
        glowColor: { value: new THREE.Color('#ff66cc') }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 glowColor;
        void main() {
            float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            float alpha = intensity * 0.65;
            gl_FragColor = vec4(glowColor, alpha);
        }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
planet.add(atmosphere);

// ---- Táº O CĂC VĂ’NG CHá»® QUAY QUANH HĂ€NH TINH --- -
function getRingMessages() {
    const cfg = window.dataLove2Loveloom?.data?.ringTexts;
    if (Array.isArray(cfg) && cfg.length > 0) {
        const texts = cfg.filter(t => typeof t === 'string' && t.trim().length > 0);
        if (texts.length > 0) return texts.map(t => `🌸 ${t.trim()} 💖`);
    }
    return ['🌸 CHÚC MỪNG NGÀY 20/10 💖 VẠN SỰ NHƯ Ý - HẠNH PHÚC 🌸'];
}

function drawRingTextTexture(ctx, width, height, message) {
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    let fontSize = Math.floor(height * 0.44);
    const setFont = size => {
        ctx.font = `900 ${size}px "Montserrat", "Segoe UI", Arial, sans-serif`;
    };
    setFont(fontSize);

    const textWidth = ctx.measureText(message).width;
    const repeats = Math.max(1, Math.floor(width / (textWidth + width * 0.05)));
    const tileWidth = width / repeats;
    const maxWidth = tileWidth * 0.94;
    if (textWidth > maxWidth) {
        fontSize = Math.max(24, Math.floor(fontSize * maxWidth / textWidth));
        setFont(fontSize);
    }

    for (let i = 0; i < repeats; i++) {
        const cx = tileWidth * (i + 0.5);
        const cy = height / 2;

        ctx.shadowColor = 'rgba(255, 0, 127, 0.95)';
        ctx.shadowBlur = fontSize * 0.3;
        ctx.lineWidth = fontSize * 0.16;
        ctx.strokeStyle = '#ff007f';
        ctx.strokeText(message, cx, cy);

        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = fontSize * 0.15;
        ctx.lineWidth = fontSize * 0.07;
        ctx.strokeStyle = '#ffd700';
        ctx.strokeText(message, cx, cy);

        const grad = ctx.createLinearGradient(0, cy - fontSize * 0.5, 0, cy + fontSize * 0.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#ffe9a8');
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = fontSize * 0.12;
        ctx.fillStyle = grad;
        ctx.fillText(message, cx, cy);
        ctx.shadowBlur = 0;
    }
}

function createTextRings() {
    const ringRadius = 13.2;
    const cylinderHeight = 4.6;
    window.textRings = [];

    const textCanvas = document.createElement('canvas');
    textCanvas.width = 4096;
    textCanvas.height = 256;
    const ctx = textCanvas.getContext('2d');
    const textMsg = getRingMessages().join('   ');
    drawRingTextTexture(ctx, textCanvas.width, textCanvas.height, textMsg);

    const ringTexture = new THREE.CanvasTexture(textCanvas);
    ringTexture.wrapS = THREE.RepeatWrapping;
    ringTexture.wrapT = THREE.ClampToEdgeWrapping;
    ringTexture.minFilter = THREE.LinearFilter;
    ringTexture.magFilter = THREE.LinearFilter;
    ringTexture.generateMipmaps = false;
    ringTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    ringTexture.needsUpdate = true;

    if (document.fonts && document.fonts.load) {
        document.fonts.load('900 100px "Montserrat"').catch(() => {}).then(() => {
            drawRingTextTexture(ctx, textCanvas.width, textCanvas.height, textMsg);
            ringTexture.needsUpdate = true;
        });
    }

    const ringGeometry = new THREE.CylinderGeometry(ringRadius, ringRadius, cylinderHeight, 160, 1, true);
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.04,
        depthWrite: false
    });

    const textRingMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    textRingMesh.renderOrder = 999;

    const ringGroup = new THREE.Group();
    ringGroup.add(textRingMesh);
    ringGroup.userData = {
        ringRadius: ringRadius,
        speed: 0.09,
        isTextRing: true,
        mesh: textRingMesh
    };

    scene.add(ringGroup);
    window.textRings.push(ringGroup);
}

// =======================================================
// VÀNH ĐAI ÁNH SÁNG DÀY DẶN, ĐA TẦNG, RỰC RỠ LUNG LINH
// (Không bị lóa trắng, giữ trọn sắc màu ngọc vũ trụ)
// =======================================================
function createGrandPlanetaryRings() {
    const ringGroup = new THREE.Group();

    // 1100 hạt bụi sao đa sắc tỏa rộng từ r=14.2 đến r=19.5
    const dustCount = 1100;
    const dustGeom = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustRadii = [];
    const dustAngles = [];
    const dustSpeeds = [];

    const ringPalette = [
        new THREE.Color('#ffd700'), // vàng kim
        new THREE.Color('#ff4081'), // hồng fuchsia
        new THREE.Color('#ffffff'), // trắng kim cương
        new THREE.Color('#ff80ab'), // hồng phấn
        new THREE.Color('#ea80fc'), // tím ngọc
        new THREE.Color('#80d8ff')  // xanh thiên thanh
    ];

    const innerR = 14.2;
    const outerR = 19.5;

    for (let i = 0; i < dustCount; i++) {
        // Phân bổ hạt dày ở giữa vành đai, mỏng dần ở mép
        const r = innerR + Math.pow(Math.random(), 0.9) * (outerR - innerR);
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.05 + (outerR - r) * 0.005;
        const y = (Math.random() - 0.5) * 0.8;

        dustRadii.push(r);
        dustAngles.push(angle);
        dustSpeeds.push(speed);

        dustPositions[i * 3] = Math.cos(angle) * r;
        dustPositions[i * 3 + 1] = y;
        dustPositions[i * 3 + 2] = Math.sin(angle) * r;

        const col = ringPalette[Math.floor(Math.random() * ringPalette.length)];
        dustColors[i * 3] = col.r;
        dustColors[i * 3 + 1] = col.g;
        dustColors[i * 3 + 2] = col.b;
    }

    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeom.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
        map: createGlowTexture(),
        size: 1.8,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const dustPoints = new THREE.Points(dustGeom, dustMat);
    ringGroup.add(dustPoints);

    ringGroup.userData = {
        dustPositions,
        dustRadii,
        dustAngles,
        dustSpeeds,
        dustGeom,
        tilt: 0.55
    };

    scene.add(ringGroup);
    window.planetaryGrandRings = ringGroup;
}

// Quầng sáng tinh tú mềm mại, tia kim cương vuốt nhọn tự nhiên
function createCelestialSparkleTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;

    // 1. Quầng sáng mềm đa tầng
    const bloom = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95);
    bloom.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    bloom.addColorStop(0.12, 'rgba(255, 235, 170, 0.95)');
    bloom.addColorStop(0.28, 'rgba(255, 120, 200, 0.7)');
    bloom.addColorStop(0.55, 'rgba(180, 100, 255, 0.35)');
    bloom.addColorStop(0.78, 'rgba(100, 200, 255, 0.12)');
    bloom.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, size, size);

    // 2. Tia kim cương vuốt nhọn tự nhiên (không dùng nét gạch chữ thập)
    function drawDiamondRay(angle, length, width, color) {
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, length);
        grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.35, color);
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, -width);
        ctx.quadraticCurveTo(length * 0.3, -width * 0.2, length, 0);
        ctx.quadraticCurveTo(length * 0.3, width * 0.2, 0, width);
        ctx.quadraticCurveTo(-length * 0.3, width * 0.2, -length, 0);
        ctx.quadraticCurveTo(-length * 0.3, -width * 0.2, 0, -width);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawDiamondRay(0, center * 0.9, size * 0.038, 'rgba(255, 215, 0, 0.9)');
    drawDiamondRay(Math.PI / 2, center * 0.9, size * 0.038, 'rgba(255, 215, 0, 0.9)');
    drawDiamondRay(Math.PI / 4, center * 0.52, size * 0.02, 'rgba(255, 160, 220, 0.6)');
    drawDiamondRay(-Math.PI / 4, center * 0.52, size * 0.02, 'rgba(255, 160, 220, 0.6)');

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

// Hệ thống tinh thể hộ tinh quay quanh tinh cầu với vệt bụi sao lấp lánh
function createCelestialSatellites() {
    const sparkleTexture = createCelestialSparkleTexture();

    // Vệ tinh chính: Ánh ngọc hồng - vàng kim
    const satMat1 = new THREE.SpriteMaterial({
        map: sparkleTexture,
        color: 0xffe0f8,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const satellite1 = new THREE.Sprite(satMat1);
    satellite1.scale.set(7.5, 7.5, 1);
    scene.add(satellite1);

    // Vệ tinh phụ: Ánh lam ngọc thiên thể
    const satMat2 = new THREE.SpriteMaterial({
        map: sparkleTexture,
        color: 0x80d8ff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const satellite2 = new THREE.Sprite(satMat2);
    satellite2.scale.set(5.5, 5.5, 1);
    scene.add(satellite2);

    // Vệt bụi sao lấp lánh bám theo vệ tinh 1
    const trailCount = 20;
    const trailGeom = new THREE.BufferGeometry();
    const trailPos = new Float32Array(trailCount * 3);
    const trailColors = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
        const c = new THREE.Color().setHSL(0.85 - i * 0.015, 0.9, 0.65);
        trailColors[i * 3] = c.r;
        trailColors[i * 3 + 1] = c.g;
        trailColors[i * 3 + 2] = c.b;
    }
    trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    trailGeom.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

    const trailMat = new THREE.PointsMaterial({
        map: createGlowTexture(),
        size: 3.2,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.75
    });
    const trailPoints = new THREE.Points(trailGeom, trailMat);
    scene.add(trailPoints);

    const history = [];

    satelliteUpdater = function (now) {
        const time = (now !== undefined ? now : performance.now()) * 0.001;

        const r1 = 16.0;
        const a1 = time * 0.38;
        const x1 = Math.cos(a1) * r1;
        const z1 = Math.sin(a1) * r1;
        const y1 = Math.sin(a1 * 2.0) * 3.2;
        satellite1.position.set(x1, y1, z1);
        const pulse1 = 7.0 + Math.sin(time * 1.8) * 1.8;
        satellite1.scale.set(pulse1, pulse1, 1);

        const r2 = 18.2;
        const a2 = -time * 0.26 + 1.4;
        const x2 = Math.cos(a2) * r2;
        const z2 = Math.sin(a2) * r2;
        const y2 = Math.cos(a2 * 1.6) * 3.8;
        satellite2.position.set(x2, y2, z2);
        const pulse2 = 5.0 + Math.cos(time * 1.6) * 1.4;
        satellite2.scale.set(pulse2, pulse2, 1);

        history.unshift({ x: x1, y: y1, z: z1 });
        if (history.length > trailCount) history.pop();

        for (let i = 0; i < history.length; i++) {
            trailPos[i * 3] = history[i].x;
            trailPos[i * 3 + 1] = history[i].y;
            trailPos[i * 3 + 2] = history[i].z;
        }
        trailGeom.attributes.position.needsUpdate = true;
    };
}

function createGlowTexture() { 
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext('2d');
    const center = size / 2;

    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 220, 240, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 105, 180, 0.45)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
}

// Khởi tạo vành đai và tinh thể hộ tinh
createGrandPlanetaryRings();
createCelestialSatellites();
createTextRings();

const _toCam = new THREE.Vector3();
const _ringAxis = new THREE.Vector3();
const _worldUp = new THREE.Vector3(0, 1, 0);

function orientRingToCamera(group) {
    _toCam.copy(camera.position);
    if (_toCam.lengthSq() < 1e-6) return;
    _toCam.normalize();
    _ringAxis.copy(_worldUp).addScaledVector(_toCam, -_worldUp.dot(_toCam));
    if (_ringAxis.lengthSq() < 1e-6) _ringAxis.set(1, 0, 0);
    _ringAxis.normalize();
    group.quaternion.setFromUnitVectors(_worldUp, _ringAxis);
}

function animatePlanetSystem(delta) {
    if (window.textRings) {
        window.textRings.forEach(ringGroup => {
            orientRingToCamera(ringGroup);
            const mesh = ringGroup.userData.mesh;
            if (mesh) mesh.rotation.y += ringGroup.userData.speed * delta;
        });
    }
    if (window.planetaryGrandRings) {
        const grand = window.planetaryGrandRings;
        orientRingToCamera(grand);
        const u = grand.userData;
        if (u && u.tilt) grand.rotateX(u.tilt);
        if (u && u.dustPositions && u.dustRadii) {
            for (let i = 0; i < u.dustRadii.length; i++) {
                u.dustAngles[i] += u.dustSpeeds[i] * delta;
                u.dustPositions[i * 3] = Math.cos(u.dustAngles[i]) * u.dustRadii[i];
                u.dustPositions[i * 3 + 2] = Math.sin(u.dustAngles[i]) * u.dustRadii[i];
            }
            u.dustGeom.attributes.position.needsUpdate = true;
        }
    }
}


// ---- VĂ’NG Láº¶P ANIMATE ----
let fadeOpacity = 0.1;
let fadeInProgress = false;

// =======================================================================
// ---- THĂM HIá»†U á»¨NG Gá»¢I Ă NHáº¤N VĂ€O TINH Cáº¦U (HINT ICON) ----
// =======================================================================

let hintIcon;
let hintText;
/**
 * Táº¡o icon con trá» chuá»™t 3D Ä‘á»ƒ gá»£i Ă½ ngÆ°á»i dĂ¹ng.
 * PHIĂN Báº¢N HOĂ€N CHá»ˆNH: Con trá» mĂ u tráº¯ng Ä‘á»“ng nháº¥t vĂ  Ä‘Æ°á»£c Ä‘áº·t á»Ÿ vá»‹ trĂ­
 * xa hÆ¡n so vá»›i quáº£ cáº§u trung tĂ¢m.
 */
function createHintIcon() {
    hintIcon = new THREE.Group();
    hintIcon.name = 'hint-icon-group';
    scene.add(hintIcon);

    const cursorVisuals = new THREE.Group();

    // --- 1. Táº O HĂŒNH Dáº NG CON TRá» (Giá»¯ nguyĂªn) ---
    const cursorShape = new THREE.Shape();
    const h = 1.5;
    const w = h * 0.5;

    cursorShape.moveTo(0, 0);
    cursorShape.lineTo(-w * 0.4, -h * 0.7);
    cursorShape.lineTo(-w * 0.25, -h * 0.7);
    cursorShape.lineTo(-w * 0.5, -h);
    cursorShape.lineTo(w * 0.5, -h);
    cursorShape.lineTo(w * 0.25, -h * 0.7);
    cursorShape.lineTo(w * 0.4, -h * 0.7);
    cursorShape.closePath();

    // --- 2. Táº O CON TRá» MĂ€U TRáº®NG ---

    // Lá»›p ná»n (trÆ°á»›c lĂ  viá»n Ä‘en, giá» lĂ  ná»n tráº¯ng)
    const backgroundGeometry = new THREE.ShapeGeometry(cursorShape);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // THAY Äá»”I: Chuyá»ƒn viá»n thĂ nh mĂ u tráº¯ng
        side: THREE.DoubleSide
    });
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

    // Lá»›p tráº¯ng bĂªn trong (giá» khĂ´ng cáº§n thiáº¿t nhÆ°ng giá»¯ láº¡i Ä‘á»ƒ Ä‘áº£m báº£o Ä‘á»™ dĂ y)
    const foregroundGeometry = new THREE.ShapeGeometry(cursorShape);
    const foregroundMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Giá»¯ mĂ u tráº¯ng
        side: THREE.DoubleSide
    });
    const foregroundMesh = new THREE.Mesh(foregroundGeometry, foregroundMaterial);

    foregroundMesh.scale.set(0.8, 0.8, 1);
    foregroundMesh.position.z = 0.01;

    cursorVisuals.add(backgroundMesh, foregroundMesh);
    cursorVisuals.position.y = h / 2;
    cursorVisuals.rotation.x = Math.PI / 2;

    // --- 3. Táº O VĂ’NG TRĂ’N BAO QUANH (Giá»¯ nguyĂªn) ---
    const ringGeometry = new THREE.RingGeometry(1.8, 2.0, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    hintIcon.userData.ringMesh = ringMesh;

    // --- 4. HOĂ€N THIá»†N ICON ---
    hintIcon.add(cursorVisuals);
    hintIcon.add(ringMesh);

    // THAY Äá»”I: Äáº·t icon á»Ÿ vá»‹ trĂ­ xa hÆ¡n
    hintIcon.position.set(1.5, 1.5, 15); // TÄƒng giĂ¡ trá»‹ Z tá»« 12 lĂªn 20

    hintIcon.scale.set(0.8, 0.8, 0.8);
    hintIcon.lookAt(planet.position);
    hintIcon.userData.initialPosition = hintIcon.position.clone();
}

/**
 * Animate icon gá»£i Ă½.
 * @param {number} time - Thá»i gian hiá»‡n táº¡i.
 */
function animateHintIcon(time) {
    if (!hintIcon) return;

    if (!introStarted) {
        hintIcon.visible = true;

        // Hiá»‡u á»©ng "nháº¥n" tá»›i lui
        const tapFrequency = 1.2;
        const tapAmplitude = 1.5;
        const tapOffset = Math.sin(time * tapFrequency) * tapAmplitude;

        // Di chuyá»ƒn icon tá»›i lui theo hÆ°á»›ng nĂ³ Ä‘ang nhĂ¬n
        const direction = new THREE.Vector3();
        hintIcon.getWorldDirection(direction);
        hintIcon.position.copy(hintIcon.userData.initialPosition).addScaledVector(direction, -tapOffset);

        // Hiá»‡u á»©ng "sĂ³ng" cho vĂ²ng trĂ²n
        const ring = hintIcon.userData.ringMesh;
        const ringScale = 1 + Math.sin(time * tapFrequency) * 0.1;
        ring.scale.set(ringScale, ringScale, 1);
        ring.material.opacity = 0.5 + Math.sin(time * tapFrequency) * 0.2;
         // Xá»­ lĂ½ vÄƒn báº£n gá»£i Ă½ (thĂªm hiá»‡u á»©ng má»›i)
        if (hintText) {
            hintText.visible = true;
            hintText.material.opacity = 0.7 + Math.sin(time * 1.4) * 0.3;
            hintText.position.y = 15 + Math.sin(time * 1.0) * 0.5;
            hintText.lookAt(camera.position);
        }
    } else {
        // áº¨n icon Ä‘i khi intro Ä‘Ă£ báº¯t Ä‘áº§u
        if (hintIcon) hintIcon.visible = false;

        if (hintText) hintText.visible = false;
    }
}

// ---- CHá»ˆNH Sá»¬A VĂ’NG Láº¶P ANIMATE ----
// Báº¡n cáº§n thay tháº¿ hĂ m animate() cÅ© báº±ng hĂ m Ä‘Ă£ Ä‘Æ°á»£c chá»‰nh sá»­a nĂ y.
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() * 0.001;
    const delta = Math.min(0.1, time - (animate._prevTime || time));
    animate._prevTime = time;

    // Cáº­p nháº­t icon gá»£i Ă½
    animateHintIcon(time);

    // ---- Camera tự trôi khi người dùng để yên ----
    if (introStarted) {
        const idleFor = (performance.now() - lastInteraction) * 0.001;
        const idleTarget = idleFor > 10 ? 1 : 0;
        idleRotateFactor += (idleTarget - idleRotateFactor) * Math.min(1, delta * 0.9);
        if (idleRotateFactor < 0.01) idleRotateFactor = 0;
        controls.autoRotate = idleRotateFactor > 0;
        controls.autoRotateSpeed = 0.35 * idleRotateFactor;
    } else {
        idleRotateFactor = 0;
        controls.autoRotate = false;
    }

    // ---- Sao 3 lớp nghiêng theo chuột ----
    starLayers.forEach(layer => {
        const targetRotY = starPointer.x * 0.1 * layer.depth;
        const targetRotX = starPointer.y * 0.07 * layer.depth;
        layer.group.rotation.y += (targetRotY - layer.group.rotation.y) * 0.035;
        layer.group.rotation.x += (targetRotX - layer.group.rotation.x) * 0.035;
        layer.group.rotation.z += delta * 0.004 * layer.depth;
    });

    // ---- Tinh vân đổi tông màu chậm ----
    nebulaSprites.forEach(nebula => {
        const u = nebula.userData;
        const hue = (u.baseHue + Math.sin(time * u.speed + u.phase) * 0.05 + 1) % 1;
        nebula.material.color.setHSL(hue, 0.72, 0.55);
    });

    updateWishStars(time);

    controls.update();
    planet.material.uniforms.time.value = time * 0.5;

    // Logic fade-in sau khi báº¯t Ä‘áº§u
    if (fadeInProgress && fadeOpacity < 1) {
        fadeOpacity += delta * 0.7;
        if (fadeOpacity > 1) fadeOpacity = 1;
    }

    if (!introStarted) {
        fadeOpacity = 0.1;
        if (fadeDirty) {
            fadeDirty = false;
            scene.traverse(obj => {
                if (!obj.material || obj.material.opacity === undefined) return;
                if (obj === planet || obj === centralGlow || obj === hintIcon || obj.name === 'starfield') return;
                if (obj.userData.isTextRing || (obj.parent && obj.parent.userData && obj.parent.userData.isTextRing)) {
                    obj.material.transparent = true;
                    obj.material.opacity = 1;
                } else if (obj.type !== 'Scene' && !(obj.parent && obj.parent.isGroup)) {
                    obj.material.transparent = true;
                    obj.material.opacity = 0.1;
                }
            });
        }
        planet.visible = true;
        centralGlow.visible = true;
    } else if (fadeOpacity < 1) {
        scene.traverse(obj => {
            if (!obj.material || obj.material.opacity === undefined) return;
            if (obj.type === 'Scene' || (obj.parent && obj.parent.isGroup)) return;
            if (obj.userData.isTextRing || (obj.parent && obj.parent.userData && obj.parent.userData.isTextRing) || obj === planet || obj === centralGlow) {
                obj.material.transparent = true;
                obj.material.opacity = 1;
                return;
            }
            obj.material.transparent = true;
            obj.material.opacity = fadeOpacity;
        });
    }

    // Cáº­p nháº­t sao bÄƒng
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.userData.life++;

        let opacity = 1.0;
        if (star.userData.life < 30) {
            opacity = star.userData.life / 30;
        } else if (star.userData.life > star.userData.maxLife - 30) {
            opacity = (star.userData.maxLife - star.userData.life) / 30;
        }

        star.userData.progress += star.userData.speed;
        if (star.userData.progress > 1) {
            scene.remove(star);
            shootingStars.splice(i, 1);
            continue;
        }

        const currentPos = star.userData.curve.getPoint(star.userData.progress);
        star.position.copy(currentPos);
        star.userData.head.material.opacity = opacity;
        star.userData.head.children[0].material.uniforms.time.value = time;

        const trail = star.userData.trail;
        const trailPoints = star.userData.trailPoints;
        trailPoints[0].copy(currentPos);
        for (let j = 1; j < star.userData.trailLength; j++) {
            const trailProgress = Math.max(0, star.userData.progress - j * 0.01);
            trailPoints[j].copy(star.userData.curve.getPoint(trailProgress));
        }
        trail.geometry.setFromPoints(trailPoints);
        trail.material.opacity = opacity * 0.7;
    }

    if (shootingStars.length < 3 && Math.random() < 0.02) {
        createShootingStar();
    }

    // Logic chuyá»ƒn Ä‘á»•i material cho cĂ¡c nhĂ³m Ä‘iá»ƒm trĂ¡i tim
    scene.traverse(obj => {
        if (obj.isPoints && obj.userData.materialNear && obj.userData.materialFar) {
            const positionAttr = obj.geometry.getAttribute('position');
            const ox = obj.position.x, oy = obj.position.y, oz = obj.position.z;
            const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
            let isClose = false;
            for (let i = 0; i < positionAttr.count; i++) {
                const dx = positionAttr.getX(i) + ox - cx;
                const dy = positionAttr.getY(i) + oy - cy;
                const dz = positionAttr.getZ(i) + oz - cz;
                if (dx * dx + dy * dy + dz * dz < 100) {
                    isClose = true;
                    break;
                }
            }
            if (isClose) {
                if (obj.material !== obj.userData.materialNear) {
                    obj.material = obj.userData.materialNear;
                    obj.geometry = obj.userData.geometryNear;
                }
            } else {
                if (obj.material !== obj.userData.materialFar) {
                    obj.material = obj.userData.materialFar;
                    obj.geometry = obj.userData.geometryFar;
                }
            }
        }
    });  

    // Cáº­p nháº­t camera

    planet.lookAt(camera.position);
    animatePlanetSystem(delta);

    if (satelliteUpdater) satelliteUpdater();
    galaxyMaterial.uniforms.uTime.value = time;

    composer.render();
}
function createHintText() {
    const canvasSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = canvasSize;
    const context = canvas.getContext('2d');
    const text = 'Chạm Vào Tinh Cầu';
    let fontSize = 54;
    context.font = `900 ${fontSize}px "Montserrat", Arial, sans-serif`;
    const measured = context.measureText(text).width;
    if (measured > 460) {
        fontSize = Math.floor(fontSize * 460 / measured);
    }
    context.font = `900 ${fontSize}px "Montserrat", Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineJoin = 'round';
    const cy = canvasSize / 2;

    context.shadowColor = '#ff007f';
    context.shadowBlur = 14;
    context.lineWidth = 8;
    context.strokeStyle = '#ff007f';
    context.strokeText(text, canvasSize / 2, cy);

    context.shadowColor = '#ffd700';
    context.shadowBlur = 8;
    context.lineWidth = 3;
    context.strokeStyle = '#ffd700';
    context.strokeText(text, canvasSize / 2, cy);

    const grad = context.createLinearGradient(0, cy - fontSize * 0.6, 0, cy + fontSize * 0.6);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#ffe9a8');
    context.shadowColor = 'rgba(255, 255, 255, 0.9)';
    context.shadowBlur = 6;
    context.fillStyle = grad;
    context.fillText(text, canvasSize / 2, cy);

    const textTexture = new THREE.CanvasTexture(canvas);
    textTexture.needsUpdate = true;
    const textMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide
    });

    const planeGeometry = new THREE.PlaneGeometry(16, 8);
    hintText = new THREE.Mesh(planeGeometry, textMaterial);
    hintText.position.set(0, 15, 0);
    scene.add(hintText);
}    

// ---- CÁC HÀM XỬ LÝ SỰ KIỆN VÀ KHỞI ĐỘNG ----
createShootingStar();
createHintIcon();
createHintText();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    controls.target.set(0, 0, 0);
    controls.update();
});
// ---- BAY MỞ MÀN: ĐƯỜNG CONG CÓ GIA TỐC (CHẬM -> BUNG NHANH -> HÃM MỀM) ----
const CAMERA_FLIGHT = {
    duration: 8.0,
    fovBase: 75,
    fovMin: 62,
    roll: 0.045,
    slowEndT: 0.42
};
const CAMERA_SPEED_KEYS = [
    [0.00, 0.30],
    [0.30, 0.85],
    [0.42, 1.25],
    [0.52, 2.60],
    [0.60, 3.20],
    [0.72, 1.70],
    [0.86, 0.45],
    [1.00, 0.10]
];
const CAMERA_SPEED_MAX = 3.2;

function cameraSpeedAt(t) {
    const keys = CAMERA_SPEED_KEYS;
    if (t <= 0) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
        const t0 = keys[i][0], v0 = keys[i][1];
        const t1 = keys[i + 1][0], v1 = keys[i + 1][1];
        if (t <= t1) {
            const k = (t - t0) / (t1 - t0);
            const e = 0.5 - 0.5 * Math.cos(Math.PI * k);
            return v0 + (v1 - v0) * e;
        }
    }
    return keys[keys.length - 1][1];
}

const CAMERA_DIST_LUT = (() => {
    const steps = 512;
    const lut = new Float32Array(steps + 1);
    let acc = 0;
    for (let i = 1; i <= steps; i++) {
        acc += cameraSpeedAt((i - 0.5) / steps);
        lut[i] = acc;
    }
    const total = acc || 1;
    for (let i = 0; i <= steps; i++) lut[i] /= total;
    return lut;
})();

function cameraProgressAt(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const last = CAMERA_DIST_LUT.length - 1;
    const idx = t * last;
    const i0 = Math.min(last - 1, Math.floor(idx));
    const frac = idx - i0;
    return CAMERA_DIST_LUT[i0] + (CAMERA_DIST_LUT[i0 + 1] - CAMERA_DIST_LUT[i0]) * frac;
}

let activeFlightCurve = null;
let cameraFlightActive = false;

function buildCameraFlightCurve(fromPos) {
    return new THREE.CatmullRomCurve3([
        fromPos.clone(),
        new THREE.Vector3(0, 22, 90),
        new THREE.Vector3(0, 10, 168),
        new THREE.Vector3(-18, 26, 72),
        new THREE.Vector3(-12, 18, 32)
    ], false, 'catmullrom', 0.5);
}

function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function startCameraAnimation(onComplete, onProgress) {
    const reduceMotion = prefersReducedMotion();
    const duration = CAMERA_FLIGHT.duration;
    const curve = buildCameraFlightCurve(camera.position);
    activeFlightCurve = curve;
    const startedAt = performance.now() * 0.001;
    const tmp = new THREE.Vector3();
    const vignette = document.getElementById('warp-vignette');
    const leakFlash = document.getElementById('warp-flash');

    function frame() {
        const elapsed = performance.now() * 0.001 - startedAt;
        const t = Math.min(1, elapsed / duration);
        const u = cameraProgressAt(t);
        curve.getPointAt(u, tmp);
        camera.position.copy(tmp);
        camera.lookAt(0, 0, 0);

        const speed = cameraSpeedAt(t);
        const burst = reduceMotion ? 0 : Math.max(0, Math.min(1, (speed - 0.9) / (CAMERA_SPEED_MAX - 0.9)));
        const fov = CAMERA_FLIGHT.fovBase - (CAMERA_FLIGHT.fovBase - CAMERA_FLIGHT.fovMin) * burst;
        if (Math.abs(camera.fov - fov) > 0.01) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
        }
        if (burst > 0.001) camera.rotateZ(CAMERA_FLIGHT.roll * burst);
        if (vignette) vignette.style.opacity = (burst * 0.85).toFixed(3);
        if (leakFlash) {
            const leak = reduceMotion ? 0 : Math.max(0, 1 - Math.abs(t - 0.55) / 0.055) * 0.42;
            leakFlash.style.opacity = leak.toFixed(3);
        }

        if (typeof onProgress === 'function') onProgress(u, t, speed / CAMERA_SPEED_MAX, burst);

        if (t >= 1) {
            curve.getPointAt(1, tmp);
            camera.position.copy(tmp);
            camera.lookAt(0, 0, 0);
            camera.fov = CAMERA_FLIGHT.fovBase;
            camera.updateProjectionMatrix();
            if (vignette) vignette.style.opacity = '0';
            if (leakFlash) leakFlash.style.opacity = '0';
            controls.target.set(0, 0, 0);
            controls.enabled = true;
            controls.update();
            cameraFlightActive = false;
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        requestAnimationFrame(frame);
    }
    controls.enabled = false;
    cameraFlightActive = true;
    frame();
}


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let introStarted = false;
let introAutoStart = false;
let lastInteraction = performance.now();
let musicIntended = false;

// =======================================================================
// ---- MỞ ĐẦU: LỜI CHÚC TRÊN NỀN ĐEN + TITLE CINEMATIC ----
// =======================================================================
const INTRO_WISH_BASE_MS = 2000;
const INTRO_WISH_PER_CHAR_MS = 30;
const INTRO_WISH_MIN_MS = 2400;
const INTRO_WISH_MAX_MS = 4400;
const INTRO_WISH_GAP_MS = 400;
const wishHoldMs = text => Math.min(INTRO_WISH_MAX_MS, Math.max(INTRO_WISH_MIN_MS, INTRO_WISH_BASE_MS + text.length * INTRO_WISH_PER_CHAR_MS));
const sleepMs = ms => new Promise(resolve => setTimeout(resolve, ms));

function playMusicWithGestureFallback() {
    const mm = window.musicManager;
    if (!mm || musicIntended) return;
    musicIntended = true;
    mm.play().catch(() => {
        const resume = () => {
            window.removeEventListener('pointerdown', resume);
            window.removeEventListener('keydown', resume);
            mm.play().catch(() => {});
        };
        window.addEventListener('pointerdown', resume, { once: true });
        window.addEventListener('keydown', resume, { once: true });
    });
}

window.cinematicTitle = {
    start() {
        const title = document.getElementById('cinematic-title');
        if (!title) return;
        title.classList.add('show');
        playMusicWithGestureFallback();
        setTimeout(() => {
            title.classList.add('settle');
            lastInteraction = performance.now();
        }, 4200);
    }
};

function beginExperience() {
    if (introStarted) return;
    introStarted = true;
    introAutoStart = true;
    fadeInProgress = true;
    document.body.classList.add('intro-started');
    const topHint = document.getElementById('text');
    if (topHint) topHint.classList.add('hidden');
    galaxyMaterial.uniforms.uRippleTime.value = performance.now() * 0.001;
    lastInteraction = performance.now();
    startCameraAnimation(
        () => { clearMemoryIntro(); window.cinematicTitle.start(); },
        (u, t, speedNorm, burst) => updateMemoryIntro(u, t, speedNorm, burst)
    );
    runMemoryIntro();
}

async function runIntroSequence() {
    const overlay = document.getElementById('intro-sequence');
    const holder = document.getElementById('intro-wishes');
    const wishes = (window.introWishes || []).filter(w => typeof w === 'string' && w.trim());

    if (!overlay || !holder || wishes.length === 0) {
        if (overlay) overlay.classList.add('done');
        await sleepMs(300);
        beginExperience();
        return;
    }

    for (const wish of wishes) {
        const text = wish.trim();
        const line = document.createElement('div');
        line.className = 'intro-wish';
        line.textContent = text;
        holder.appendChild(line);
        void line.offsetWidth;
        line.classList.add('show');
        await sleepMs(wishHoldMs(text));
        line.classList.add('hide');
        await sleepMs(INTRO_WISH_GAP_MS);
        line.remove();
    }

    await sleepMs(900);
    overlay.classList.add('fade-out');
    beginExperience();
    setTimeout(() => overlay.classList.add('done'), 2000);
}

const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, sleepMs(1500)]).then(runIntroSequence);

// =======================================================================
// ---- RỪNG KÝ ỨC: THẺ ẢNH 2D BẬT LÊN + TẤM ẢNH 3D LƯỚT QUA ----
// =======================================================================
const MEMORY_INTRO = {
    cardCount: 6,
    plateCount: 3,
    cardFirstT: 0.02,
    cardSpacingT: 0.052,
    cardSpacingJitterT: 0.012,
    whooshT: 0.38,
    plateHoldEndT: 0.46,
    cardHoldMin: 1400,
    cardHoldMax: 2200,
    cardSizeMinVmin: 16,
    cardSizeMaxVmin: 38,
    plateSize: 18
};

const memoryFlashLayer = document.getElementById('memory-flash');
const memoryPlates = new THREE.Group();
memoryPlates.name = 'memoryPlates';
memoryPlates.visible = false;
scene.add(memoryPlates);

const memoryCards = [];
const memoryPlateItems = [];
let memoryIntroRunning = false;
let memoryIntroPrepared = false;

function pickMemorySources(count) {
    const pool = Array.from(new Set(heartPointClouds.map(o => o.userData.src).filter(Boolean)));
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const swap = pool[i]; pool[i] = pool[j]; pool[j] = swap;
    }
    return pool.slice(0, count);
}

function loadImageElement(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

function buildMemoryPlate(img) {
    const texture = createNeonTexture(img, 512);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(MEMORY_INTRO.plateSize, MEMORY_INTRO.plateSize), material);
    mesh.renderOrder = 6;

    const u0 = 0.06 + Math.random() * 0.30;
    let base = new THREE.Vector3(0, 20, 70);
    if (activeFlightCurve) base = activeFlightCurve.getPointAt(u0);
    const pos = base.clone().multiplyScalar(0.34 + Math.random() * 0.46);
    pos.x += (Math.random() < 0.5 ? -1 : 1) * (7 + Math.random() * 12);
    pos.y += (Math.random() - 0.5) * 18;
    pos.z += (Math.random() - 0.5) * 12;
    mesh.position.copy(pos);
    mesh.userData.tilt = (Math.random() - 0.5) * 0.34;
    mesh.userData.appearT = 0.03 + Math.random() * 0.22;
    mesh.userData.phase = Math.random() * Math.PI * 2;

    memoryPlates.add(mesh);
    memoryPlateItems.push({ mesh, material, texture });
}

function buildMemoryCard(img) {
    if (!memoryFlashLayer) return;
    const texture = createNeonTexture(img, 512);
    const dataUrl = texture.image.toDataURL('image/png');
    texture.dispose();

    const size = MEMORY_INTRO.cardSizeMinVmin + Math.random() * (MEMORY_INTRO.cardSizeMaxVmin - MEMORY_INTRO.cardSizeMinVmin);
    const vminPx = Math.min(window.innerWidth, window.innerHeight) / 100;
    const sizePx = size * vminPx;
    const maxLeft = Math.max(0, window.innerWidth - sizePx);
    const maxTop = Math.max(0, window.innerHeight - sizePx);
    const cx0 = window.innerWidth * 0.34, cx1 = window.innerWidth * 0.66;
    const cy0 = window.innerHeight * 0.26, cy1 = window.innerHeight * 0.74;

    let left = 0, top = 0, guard = 0;
    do {
        left = Math.random() * maxLeft;
        top = Math.random() * maxTop;
        guard++;
    } while (guard < 20 && left + sizePx > cx0 && left < cx1 && top + sizePx > cy0 && top < cy1);

    const card = document.createElement('div');
    card.className = 'memory-card';
    card.style.left = left.toFixed(0) + 'px';
    card.style.top = top.toFixed(0) + 'px';
    card.style.width = size.toFixed(1) + 'vmin';
    card.style.height = size.toFixed(1) + 'vmin';

    const inner = document.createElement('div');
    inner.className = 'memory-card-inner';
    inner.style.setProperty('--rot', ((Math.random() - 0.5) * 16).toFixed(1) + 'deg');

    const imgEl = document.createElement('img');
    imgEl.src = dataUrl;
    imgEl.alt = '';
    inner.appendChild(imgEl);
    card.appendChild(inner);
    memoryFlashLayer.appendChild(card);

    const dirX = (left + sizePx / 2) < window.innerWidth / 2 ? -1 : 1;
    const dirY = (top + sizePx / 2) < window.innerHeight / 2 ? -1 : 1;
    memoryCards.push({
        el: card,
        depth: 0.55 + Math.random() * 1.1,
        dirX: dirX * (0.4 + Math.random() * 0.9),
        dirY: dirY * (0.25 + Math.random() * 0.7),
        startT: 0,
        u0: 0,
        spawned: false,
        whooshed: false
    });
    return memoryCards[memoryCards.length - 1];
}

async function runMemoryIntro() {
    if (memoryIntroRunning || memoryIntroPrepared) return;
    memoryIntroPrepared = true;
    if (document.body.classList.contains('portrait-mode')) return;

    const reduceMotion = prefersReducedMotion();
    let cardCount = MEMORY_INTRO.cardCount;
    let plateCount = MEMORY_INTRO.plateCount;
    if (reduceMotion) {
        cardCount = 2;
        plateCount = 1;
    } else if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4) {
        cardCount = 3;
        plateCount = 2;
    }

    let sources = pickMemorySources(Math.min(10, cardCount + plateCount));
    let tries = 0;
    while (sources.length < 2 && tries < 6) {
        await sleepMs(400);
        if (!introStarted) return;
        sources = pickMemorySources(Math.min(10, cardCount + plateCount));
        tries++;
    }
    if (sources.length < 2) return;
    memoryIntroRunning = true;

    const plateSrcs = sources.slice(0, plateCount);
    const cardSrcs = sources.slice(plateCount, plateCount + cardCount);

    for (const src of plateSrcs) {
        const img = await loadImageElement(src);
        if (img && memoryIntroRunning) buildMemoryPlate(img);
    }
    if (memoryPlateItems.length > 0) memoryPlates.visible = true;

    let index = 0;
    for (const src of cardSrcs) {
        const img = await loadImageElement(src);
        if (!img || !memoryIntroRunning) continue;
        const card = buildMemoryCard(img);
        if (!card) continue;
        const jitter = (Math.random() - 0.5) * 2 * MEMORY_INTRO.cardSpacingJitterT;
        card.startT = MEMORY_INTRO.cardFirstT + index * MEMORY_INTRO.cardSpacingT + jitter;
        card.u0 = cameraProgressAt(card.startT);
        index++;
    }
}

function updateMemoryIntro(u, t, speedNorm, burst) {
    if (!memoryIntroRunning) return;

    for (const item of memoryPlateItems) {
        const mesh = item.mesh;
        const appear = clamp01((t - mesh.userData.appearT) / 0.12);
        const vanish = clamp01((t - MEMORY_INTRO.plateHoldEndT) / 0.12);
        item.material.opacity = 0.92 * appear * (1 - vanish);
        mesh.lookAt(camera.position);
        mesh.rotateZ(mesh.userData.tilt + 0.05 * Math.sin(t * 6 + mesh.userData.phase));
        const scale = 1 + 0.05 * Math.sin(t * 5 + mesh.userData.phase);
        mesh.scale.set(scale, scale, 1);
    }

    for (const card of memoryCards) {
        if (!card.el.isConnected) continue;
        if (!card.spawned && t >= card.startT) {
            card.spawned = true;
            const el = card.el;
            requestAnimationFrame(() => el.classList.add('show'));
            const hold = MEMORY_INTRO.cardHoldMin + Math.random() * (MEMORY_INTRO.cardHoldMax - MEMORY_INTRO.cardHoldMin);
            setTimeout(() => {
                if (!el.isConnected || el.classList.contains('whoosh')) return;
                el.classList.add('hide');
            }, hold);
        }
        if (card.spawned) {
            const k = (t - card.startT) * 330 * card.depth;
            card.el.style.transform = 'translate3d(' + (card.dirX * k).toFixed(1) + 'px, ' + (card.dirY * k).toFixed(1) + 'px, 0)';
        }
        if (!card.whooshed && t >= MEMORY_INTRO.whooshT) {
            card.whooshed = true;
            card.el.classList.remove('hide');
            card.el.classList.add('whoosh');
        }
    }
}

function clearMemoryIntro() {
    memoryIntroRunning = false;
    for (const card of memoryCards) {
        if (card.el && card.el.isConnected) card.el.remove();
    }
    memoryCards.length = 0;
    for (const item of memoryPlateItems) {
        memoryPlates.remove(item.mesh);
        item.mesh.geometry.dispose();
        item.material.dispose();
        item.texture.dispose();
    }
    memoryPlateItems.length = 0;
    memoryPlates.visible = false;
    activeFlightCurve = null;
}

// =======================================================================
// ---- LỜI CHÚC CUỐI: FORM + BĂNG SAO MANG LỜI CHÚC ----
// =======================================================================
const WISH_STORAGE_KEY = 'vuTru20_10_wishes';
const wishStars = [];
const viewedPhotos = new Set();

function createWishTexture(text) {
    const width = 1024;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const fontFor = size => `700 ${size}px "Quicksand", "Montserrat", Arial, sans-serif`;
    let fontSize = 56;
    ctx.font = fontFor(fontSize);
    const maxWidth = width * 0.86;
    const measured = ctx.measureText(text).width;
    if (measured > maxWidth) {
        fontSize = Math.max(20, Math.floor(fontSize * maxWidth / measured));
    }

    ctx.font = fontFor(fontSize);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    ctx.shadowColor = 'rgba(255, 90, 170, 0.95)';
    ctx.shadowBlur = 26;
    ctx.lineWidth = fontSize * 0.14;
    ctx.strokeStyle = '#ff4f9a';
    ctx.strokeText(text, width / 2, height / 2);

    const grad = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#ffe9a8');
    ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = grad;
    ctx.fillText(text, width / 2, height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
}

function spawnWishStar(text, instant = false) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: createWishTexture(text),
        transparent: true,
        opacity: instant ? 0.85 : 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
    sprite.renderOrder = 1005;

    const angle = Math.random() * Math.PI * 2;
    const radius = 26 + Math.random() * 12;
    const target = new THREE.Vector3(
        Math.cos(angle) * radius,
        12 + Math.random() * 14,
        Math.sin(angle) * radius
    );
    const start = new THREE.Vector3(0, -4, 0);
    sprite.scale.set(9.2, 2.3, 1);
    sprite.position.copy(instant ? target : start);

    scene.add(sprite);
    wishStars.push({
        sprite,
        start,
        target,
        bornAt: performance.now() * 0.001,
        instant,
        phase: Math.random() * Math.PI * 2
    });
}

function updateWishStars(time) {
    wishStars.forEach(wish => {
        const age = time - wish.bornAt;
        if (wish.instant) {
            wish.sprite.position.y = wish.target.y + Math.sin(time * 0.6 + wish.phase) * 0.5;
            return;
        }
        const t = Math.min(1, age / 2.6);
        const eased = 1 - Math.pow(1 - t, 3);
        wish.sprite.position.lerpVectors(wish.start, wish.target, eased);
        wish.sprite.position.y += Math.sin(time * 0.9 + wish.phase) * 0.5 * t;
        wish.sprite.material.opacity = Math.min(0.92, t * 1.25);
    });
}

function loadStoredWishes() {
    try {
        const saved = JSON.parse(localStorage.getItem(WISH_STORAGE_KEY) || '[]');
        if (Array.isArray(saved)) {
            saved.filter(text => typeof text === 'string' && text.trim()).forEach(text => spawnWishStar(text, true));
        }
    } catch (e) {}
}

function saveWish(text) {
    try {
        const saved = JSON.parse(localStorage.getItem(WISH_STORAGE_KEY) || '[]');
        saved.push(text);
        localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(saved.slice(-12)));
    } catch (e) {}
}

const wishPanel = document.getElementById('wish-panel');
const wishInput = document.getElementById('wish-input');

function maybeShowWishPanel() {
    const total = heartPointClouds.length;
    if (!wishPanel || total === 0 || viewedPhotos.size < total) return;
    setTimeout(() => { if (!wishPanel.hidden) return; wishPanel.hidden = false; }, 700);
}

const wishSendBtn = document.getElementById('wish-send');
if (wishSendBtn) {
    wishSendBtn.addEventListener('click', () => {
        const text = wishInput ? wishInput.value.trim() : '';
        if (!text) { if (wishInput) wishInput.focus(); return; }
        saveWish(text);
        spawnWishStar(text);
        if (wishInput) wishInput.value = '';
        if (wishPanel) wishPanel.hidden = true;
    });
}
const wishCloseBtn = document.getElementById('wish-close');
if (wishCloseBtn) {
    wishCloseBtn.addEventListener('click', () => { if (wishPanel) wishPanel.hidden = true; });
}
if (wishInput) {
    wishInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && wishSendBtn) wishSendBtn.click();
    });
}
loadStoredWishes();

function showLightbox(src) {
    const lightbox = document.getElementById('photo-lightbox');
    if (!lightbox) return;
    const img = lightbox.querySelector('img');
    if (img) img.src = src;
    lightbox.hidden = false;
}

function hideLightbox() {
    const lightbox = document.getElementById('photo-lightbox');
    if (!lightbox) return;
    lightbox.hidden = true;
    const img = lightbox.querySelector('img');
    if (img) img.removeAttribute('src');
}

const lightboxEl = document.getElementById('photo-lightbox');
if (lightboxEl) lightboxEl.addEventListener('click', hideLightbox);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideLightbox();
});

function onCanvasClick(event) {
    if (!introStarted || cameraFlightActive) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const heartIntersects = raycaster.intersectObjects(heartPointClouds);
    if (heartIntersects.length > 0) {
        const targetObject = heartIntersects[0].object;
        controls.target.copy(targetObject.position);
        if (targetObject.userData.src) {
            showLightbox(targetObject.userData.src);
            viewedPhotos.add(targetObject.userData.src);
            maybeShowWishPanel();
            lastInteraction = performance.now();
        }
    }
}

let pointerDownPos = null;
renderer.domElement.addEventListener('pointerdown', e => {
    pointerDownPos = { x: e.clientX, y: e.clientY };
});
renderer.domElement.addEventListener('click', e => {
    if (pointerDownPos && Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) return;
    onCanvasClick(e);
});

['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => { lastInteraction = performance.now(); }, { passive: true });
});

const snapshotBtn = document.getElementById('snapshot-btn');
if (snapshotBtn) {
    snapshotBtn.addEventListener('click', () => {
        composer.render();
        const link = document.createElement('a');
        link.download = `vu-tru-20-10-${Date.now()}.png`;
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();
    });
}

animate();

planet.name = 'main-planet';
centralGlow.name = 'main-glow';

// ---- CĂC THIáº¾T Láº¬P CHO GIAO DIá»†N VĂ€ MOBILE ----
function setFullScreen() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    const container = document.getElementById('container');
    if (container) {
        container.style.height = `${window.innerHeight}px`;
    }
}

window.addEventListener('resize', setFullScreen);
window.addEventListener('orientationchange', () => {
    setTimeout(setFullScreen, 300);
});
setFullScreen();

const preventDefault = event => event.preventDefault();
document.addEventListener('touchmove', preventDefault, { passive: false });
document.addEventListener('gesturestart', preventDefault, { passive: false });

const container = document.getElementById('container');
if (container) {
    container.addEventListener('touchmove', preventDefault, { passive: false });
}


// =======================================================================
// ---- KIá»‚M TRA HÆ¯á»NG MĂ€N HĂŒNH Äá»‚ HIá»‚N THá» Cáº¢NH BĂO ----
// =======================================================================

function checkOrientation() {
    // Kiá»ƒm tra náº¿u chiá»u cao lá»›n hÆ¡n chiá»u rá»™ng (mĂ n hĂ¬nh dá»c trĂªn Ä‘iá»‡n thoáº¡i)
    // ThĂªm má»™t Ä‘iá»u kiá»‡n nhá» Ä‘á»ƒ khĂ´ng kĂ­ch hoáº¡t trĂªn mĂ n hĂ¬nh desktop háº¹p.
    const isMobilePortrait = window.innerHeight > window.innerWidth && 'ontouchstart' in window;

    if (isMobilePortrait) {
        document.body.classList.add('portrait-mode');
    } else {
        document.body.classList.remove('portrait-mode');
    }
}

// Láº¯ng nghe cĂ¡c sá»± kiá»‡n Ä‘á»ƒ kiá»ƒm tra láº¡i hÆ°á»›ng mĂ n hĂ¬nh
window.addEventListener('DOMContentLoaded', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => {
    // ThĂªm Ä‘á»™ trá»… Ä‘á»ƒ trĂ¬nh duyá»‡t cáº­p nháº­t kĂ­ch thÆ°á»›c chĂ­nh xĂ¡c
    setTimeout(checkOrientation, 200); 
});
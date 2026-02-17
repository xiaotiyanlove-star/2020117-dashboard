import { html } from 'hono/html'

interface GraphPageProps {
  data: any
  t: any
}

export const GraphPage = (props: GraphPageProps) => {
  const { data, t } = props

  return (
    <div style="width: 100%; height: calc(100vh - 140px); position: relative; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: #000;">
      <div id="graph-container" style="width: 100%; height: 100%;"></div>

      <div style="position: absolute; top: 16px; left: 16px; pointer-events: none; background: rgba(0,0,0,0.7); padding: 12px; border-radius: 4px; border: 1px solid var(--accent-dim);">
        <div style="color: var(--accent); font-family: var(--font-mono); font-size: 12px; margin-bottom: 4px;">NETWORK NODES</div>
        <div style="color: #fff; font-size: 24px; font-weight: 700;">{data.nodes.length}</div>
      </div>

      <script src="//unpkg.com/force-graph"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
        try {
            const data = ${JSON.stringify(data || { nodes: [], links: [] })};
            const elem = document.getElementById('graph-container');
            
            // 1. Prevent Double Rendering: Clear container
            if (elem) elem.innerHTML = '';

            if (typeof ForceGraph === 'undefined') {
                throw new Error('Graph library not loaded');
            }

            // Image Loader (Robohash Fallback)
            const imgs = {};
            const loadImage = (node) => {
                const img = new Image();
                img.onload = () => { imgs[node.id] = img; };
                img.onerror = () => {
                    if (!img.src.includes('robohash.org')) {
                        img.src = \`https://robohash.org/\${node.id}?set=set1&bgset=bg2&size=64x64\`;
                    }
                };
                img.src = node.picture || \`https://robohash.org/\${node.id}?set=set1&bgset=bg2&size=64x64\`;
                imgs[node.id] = img;
            };

            data.nodes.forEach(node => {
                if (node.type === 'AGENT') loadImage(node);
            });

            const Graph = ForceGraph()(elem)
              .graphData(data)
              .width(elem.offsetWidth)
              .height(elem.offsetHeight)
              .nodeLabel('name')
              .nodeColor(node => node.type === 'KIND' ? '#ff00c8' : '#00ffc8')
              .nodeVal('val')
              .linkColor(() => 'rgba(0, 255, 200, 0.2)')
              .backgroundColor('#050505')
              .nodeCanvasObject((node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12/globalScale;
                ctx.font = \`\${fontSize}px Sans-Serif\`;
                const r = node.val ? Math.sqrt(node.val) * 2 : 4; 
                
                if (node.type === 'AGENT') {
                    const img = imgs[node.id];
                    if (img && img.complete && img.naturalHeight !== 0) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                        ctx.clip();
                        try {
                            ctx.drawImage(img, node.x - r, node.y - r, r * 2, r * 2);
                        } catch(e) {
                            ctx.fillStyle = '#00ffc8';
                            ctx.fill();
                        }
                        ctx.restore();
                        ctx.strokeStyle = '#00ffc8';
                        ctx.lineWidth = 1/globalScale;
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                        ctx.fillStyle = '#111'; 
                        ctx.fill();
                        ctx.strokeStyle = '#00ffc8';
                        ctx.lineWidth = 1/globalScale;
                        ctx.stroke();
                    }
                    
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillText(label, node.x, node.y + r + 1);
                } else {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color || '#ff00c8';
                    ctx.fill();
                    if (globalScale > 1.5) {
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                        ctx.fillText(label, node.x, node.y + r + 2);
                    }
                }
              })
              .onNodeClick(node => {
                if (node.type === 'AGENT') window.open('/u/' + node.id, '_blank');
              })
              .onEngineStop(() => {
                Graph.zoomToFit(400); 
              });
            
            // Initial Zoom after a short delay to ensure layout is ready, but avoid aggressive "jump"
            // setTimeout(() => Graph.zoomToFit(400, 20), 200);

            window.addEventListener('resize', () => {
              Graph.width(elem.offsetWidth);
              Graph.height(elem.offsetHeight);
            });
            
        } catch (err) {
            console.error(err);
        }
      `}} />
    </div>
  )
}

export const SKELETON_PAIRS = [
  [0, 1], [0, 2], [1, 3], [2, 4], [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], [5, 11], [6, 12],
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16]
];

export function drawDetection(ctx, videoEl, result, width, height) {
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  // Draw video frame
  ctx.drawImage(videoEl, 0, 0, width, height);

  if (!result) return;

  const { boxes = [], keypoints = [], label, fight_prob, log_entry } = result;
  const isFight = log_entry?.alert || label === 'Fight';

  // Calculate the dimensions of the image that was sent to the backend
  const aspect = videoEl.videoWidth / videoEl.videoHeight;
  let sentW = videoEl.videoWidth;
  let sentH = videoEl.videoHeight;
  if (sentW > sentH && sentW > 480) {
    sentW = 480;
    sentH = 480 / aspect;
  } else if (sentH > sentW && sentH > 480) {
    sentH = 480;
    sentW = 480 * aspect;
  }

  const scaleX = width / sentW;
  const scaleY = height / sentH;

  // Draw bounding boxes
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#06b6d4'; // cyan
  ctx.fillStyle = '#06b6d4';
  ctx.font = '14px sans-serif';

  boxes.forEach(([x1, y1, x2, y2, conf]) => {
    const bx1 = x1 * scaleX;
    const by1 = y1 * scaleY;
    const bx2 = x2 * scaleX;
    const by2 = y2 * scaleY;
    const bw = bx2 - bx1;
    const bh = by2 - by1;

    ctx.strokeRect(bx1, by1, bw, bh);
    ctx.fillText(`${(conf * 100).toFixed(0)}%`, bx1, by1 - 5);
  });

  // Draw keypoints (skeleton)
  ctx.strokeStyle = '#eab308'; // yellow
  ctx.fillStyle = '#eab308';
  ctx.lineWidth = 2;

  keypoints.forEach((personPts) => {
    // Draw points
    personPts.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x * scaleX, y * scaleY, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw bones
    SKELETON_PAIRS.forEach(([i, j]) => {
      const p1 = personPts[i];
      const p2 = personPts[j];
      if (p1 && p2 && p1[0] > 0 && p2[0] > 0) {
        ctx.beginPath();
        ctx.moveTo(p1[0] * scaleX, p1[1] * scaleY);
        ctx.lineTo(p2[0] * scaleX, p2[1] * scaleY);
        ctx.stroke();
      }
    });
  });

  // Draw Banner
  if (label) {
    ctx.fillStyle = isFight ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)';
    ctx.fillRect(0, 0, width, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isFight ? 'FIGHT DETECTED' : 'SAFE', width / 2, 28);
    ctx.textAlign = 'left'; // reset
  }

  // Draw Confidence Bar
  if (fight_prob !== undefined) {
    const barHeight = 8;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, height - barHeight, width, barHeight);

    ctx.fillStyle = isFight ? '#ef4444' : '#22c55e';
    ctx.fillRect(0, height - barHeight, width * fight_prob, barHeight);
  }

}

import { getIcon } from '../../scripts/scripts.js';

export default async function decorate(block) {
    const rows = [...block.children];
    const img1 = rows[0]?.children[1].innerHTML;
    const img2 = rows[1]?.children[1].innerHTML;
    block.parentElement.classList.add('default-content-wrapper');
    block.textContent = `${img1} and ${img2}`;
}

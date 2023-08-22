import {Avatar} from './avatar';
import {GeoDaLogo} from './geoda-logo';
import {
  IconBoxplot,
  IconCartogram,
  IconChatgpt,
  IconChoropleth,
  IconHistogram,
  IconLisa,
  IconMap,
  IconOpen,
  IconParallel,
  IconScatterplot,
  IconTable,
  IconWeights
} from './icons';

export function Navigator() {
  return (
    <div className="toolbar">
      <GeoDaLogo className="logo-box" geodaLogoClassName="geo-da-logo-instance" />
      <div className="tool-box">
        <IconOpen className="icon-open-instance" />
        <IconTable className="icon-table-instance" />
        <IconMap className="icon-map-instance" />
        <IconWeights className="icon-weights-instance" />
        <IconChoropleth className="design-component-instance-node" />
        <IconHistogram className="design-component-instance-node" />
        <IconBoxplot className="icon-boxplot-instance" />
        <IconScatterplot className="design-component-instance-node" />
        <IconCartogram className="icon-cartogram-instance" />
        <IconParallel className="icon-parallel-instance" />
        <IconLisa className="icon-lisa-instance" />
        <IconChatgpt className="design-component-instance-node" />
      </div>
      <div className="user-box">
        <Avatar />
      </div>
    </div>
  );
}

import { Box, Eye, Lightbulb, LockKeyhole, MapPin, PanelTop } from "lucide-react";
import { useSceneStore } from "../store/sceneStore.js";

export function SceneTree({ sceneConfig, selectedObjectId }) {
  const setSelectedObjectId = useSceneStore((state) => state.setSelectedObjectId);
  const groups = [
    {
      id: "objects",
      title: "Objects",
      items: sceneConfig.objects,
      icon: Box,
      selectable: true,
      getTitle: (object) => object.name,
      getMeta: (object) => object.type,
      getTrailing: (object) => (
        object.visible ? <Eye size={15} strokeWidth={2.2} /> : <LockKeyhole size={15} strokeWidth={2.2} />
      )
    },
    {
      id: "lights",
      title: "Lights",
      items: sceneConfig.lights ?? [],
      icon: Lightbulb,
      getTitle: (light) => light.name ?? light.id,
      getMeta: (light) => light.type ?? "light"
    },
    {
      id: "uiPanels",
      title: "UI Panels",
      items: sceneConfig.uiPanels ?? [],
      icon: PanelTop,
      getTitle: (panel) => panel.title,
      getMeta: (panel) => panel.id
    },
    {
      id: "hotspots",
      title: "Hotspots",
      items: sceneConfig.hotspots ?? [],
      icon: MapPin,
      getTitle: (hotspot) => hotspot.label,
      getMeta: (hotspot) => hotspot.trigger
    }
  ];

  return (
    <section className="admin-panel scene-tree-panel" aria-label="对象树">
      <div className="admin-panel-heading">
        <span>Scene Tree</span>
        <strong>对象树</strong>
      </div>
      <div className="scene-tree">
        {groups.map((group) => (
          <TreeGroup
            key={group.id}
            group={group}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
          />
        ))}
      </div>
    </section>
  );
}

function TreeGroup({ group, selectedObjectId, onSelectObject }) {
  const Icon = group.icon;

  return (
    <div className="scene-tree-group">
      <div className="scene-tree-group-heading">
        <span>{group.title}</span>
        <small>{group.items.length}</small>
      </div>
      {group.items.length ? (
        group.items.map((item) => (
          <TreeNode
            key={item.id}
            item={item}
            group={group}
            icon={Icon}
            selectedObjectId={selectedObjectId}
            onSelectObject={onSelectObject}
          />
        ))
      ) : (
        <p className="scene-tree-empty">暂无 {group.title}</p>
      )}
    </div>
  );
}

function TreeNode({ item, group, icon: Icon, selectedObjectId, onSelectObject }) {
  const content = (
    <>
      <Icon size={16} strokeWidth={2.2} />
      <span>
        <strong>{group.getTitle(item)}</strong>
        <small>{group.getMeta(item)}</small>
      </span>
      {group.getTrailing?.(item) ?? <i aria-hidden="true" />}
    </>
  );

  if (!group.selectable) {
    return <div className="scene-tree-node is-readonly">{content}</div>;
  }

  return (
    <button
      type="button"
      className={item.id === selectedObjectId ? "is-active" : ""}
      onClick={() => onSelectObject(item.id)}
    >
      {content}
    </button>
  );
}

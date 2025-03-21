import { Container } from "@/components/ui/container";
import SettingsSection from "@/components/SettingsSection";
import { SettingsState } from "@/lib/types";

interface SettingsPageProps {
  settings: SettingsState;
  updateSetting: (key: keyof SettingsState, value: any) => void;
}

const SettingsPage = ({ settings, updateSetting }: SettingsPageProps) => {
  return (
    <Container>
      <SettingsSection settings={settings} updateSetting={updateSetting} />
    </Container>
  );
};

export default SettingsPage;

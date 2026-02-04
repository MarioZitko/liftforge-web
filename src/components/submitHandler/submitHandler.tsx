import { IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "../buttons/button";
import { ButtonGroup } from "../buttons/button-group";
import { GridItem } from "../grid/Grid";
import { Card, CardContent } from "../ui/card";
import { Stack } from "../ui/stack";
import { ISubmitHandlerProps } from "./types";

export default function SubmitHandler({
  saveLabel,
  handleCancel,
  handleSubmit,
}: ISubmitHandlerProps) {
  return (
    <GridItem xs={12}>
      <Card>
        <CardContent>
          <Stack direction="column" spacing={3}>
            <ButtonGroup>
              <Button type="button" variant="outline" onClick={handleCancel}>
                <IconX size={16} />
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmit}>
                <IconCheck size={16} />
                {saveLabel || "Save"}
              </Button>
            </ButtonGroup>
          </Stack>
        </CardContent>
      </Card>
    </GridItem>
  );
}

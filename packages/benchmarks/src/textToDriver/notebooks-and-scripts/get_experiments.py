import json
from typing import List, Optional, Dict
from pydantic import BaseModel, ValidationError
from pprint import pprint
import csv
import os


class Metadata(BaseModel):
    label: str
    RUN_ID: Optional[str]
    metadata: Optional[dict]
    provider: str
    developer: str
    authorized: bool
    deployment: str
    sleepBeforeMs: Optional[int]
    maxConcurrency: int
    promptStrategy: str
    sampleDocumentLimit: int
    generateCollectionSchemas: bool


class ExperimentDataRow(BaseModel):
    Experiment_name: str
    CorrectOutputFuzzy: float
    SuccessfulExecution: float
    QueryExecutionTimeMinutes: float
    Duration: float
    LLM_duration: float
    Prompt_tokens: float
    Completion_tokens: float
    Total_tokens: float
    Avatar: str
    Name: str
    Date: str
    Examples: int
    Source: str
    Metadata: Metadata
    ID: str


class ExperimentDataCsvOut(BaseModel):
    experiment_name: str
    correct_output_fuzzy: float
    successful_execution: float
    query_execution_time_minutes: float
    duration: float
    llm_duration: float
    prompt_tokens: float
    completion_tokens: float
    total_tokens: float
    examples: int
    model: str
    provider: str
    developer: str
    prompt_strategy: str
    sample_document_limit: int
    generate_collection_schemas: bool
    few_shot_prompt: bool
    chain_of_thought_prompt: bool


def process_line_separated_data(input_text: str) -> List[List[str]]:
    """
    Process line-break separated data into a list of rows.

    Args:
        input_text (str): The input text data where values are separated by line breaks

    Returns:
        List[List[str]]: List of rows, where each row is a list of values
    """
    input_text = input_text.strip()
    # Split the text into individual lines and remove empty lines
    lines = [line.strip() for line in input_text.split('\n') if line.strip()]

    # Calculate number of columns based on the header section
    columns_per_row = 16

    # Validate that we have complete rows
    if len(lines) % columns_per_row != 0:
        raise ValueError(
            f"Input data is not properly formatted. Each row should have {columns_per_row} elements.")

    # Group lines into rows
    rows: List[List[str]] = []
    for i in range(0, len(lines), columns_per_row):
        row = lines[i:i + columns_per_row]
        rows.append(row)

    return rows


def make_data_dicts(rows: List[List[str]]) -> List[dict]:
    """
    Convert a list of rows into a list of dictionaries.

    Args:
        rows (List[List[str]]): List of rows, where each row is a list of values

    Returns:
        List[dict]: List of dictionaries, where each dictionary represents a row
    """
    headers = rows[0]
    data_rows = rows[1:]
    data_dicts = []
    for data_row in data_rows:
        data_dict = dict(zip(headers, data_row))
        data_dict['Metadata'] = json.loads(data_dict['Metadata'])
        data_dicts.append(data_dict)
    return data_dicts


def percentage_to_decimal(percentage_str: str) -> float:
    return round(float(percentage_str.strip('%')) / 100, 4)


def duration_to_float(duration_str: str) -> float:
    # Remove the 's' character and convert to float
    return float(duration_str.strip('s'))


def is_chain_of_thought_prompt(prompt: str) -> bool:
    return "chainOfThought".lower() in prompt.lower()


def is_few_shot_prompt(prompt: str) -> bool:
    return "genericFewShot".lower() in prompt.lower()


def validate_and_convert(data_dicts: List[Dict[str, any]]) -> List[ExperimentDataCsvOut]:
    validated_data = []

    for data_dict in data_dicts:
        try:

            # Ensure the keys match the field names in the Pydantic model
            data_dict['Experiment_name'] = data_dict.pop('Experiment name')
            data_dict['LLM_duration'] = data_dict.pop('LLM duration')
            data_dict['Prompt_tokens'] = float(data_dict.pop('Prompt tokens'))
            data_dict['Completion_tokens'] = float(
                data_dict.pop('Completion tokens'))
            data_dict['Total_tokens'] = float(data_dict.pop('Total tokens'))
            data_dict['CorrectOutputFuzzy'] = percentage_to_decimal(
                data_dict.pop('CorrectOutputFuzzy'))
            data_dict['SuccessfulExecution'] = percentage_to_decimal(
                data_dict.pop('SuccessfulExecution'))
            data_dict['QueryExecutionTimeMinutes'] = percentage_to_decimal(
                data_dict.pop('QueryExecutionTimeMinutes'))
            data_dict['Duration'] = duration_to_float(
                data_dict.pop('Duration'))
            data_dict['LLM_duration'] = duration_to_float(
                data_dict['LLM_duration'])

            if 'sleepBeforeMs' not in data_dict['Metadata']:
                data_dict['Metadata']['sleepBeforeMs'] = None
            if 'RUN_ID' not in data_dict['Metadata']:
                data_dict['Metadata']['RUN_ID'] = None
            if 'metadata' not in data_dict['Metadata']:
                data_dict['Metadata']['metadata'] = None
            # Validate data_dict conforms to ExperimentDataRow
            experiment_data_row = ExperimentDataRow(**data_dict)

            # Convert to ExperimentDataCsvOut
            experiment_data_csv_out = ExperimentDataCsvOut(
                experiment_name=experiment_data_row.Experiment_name,
                correct_output_fuzzy=experiment_data_row.CorrectOutputFuzzy,
                successful_execution=experiment_data_row.SuccessfulExecution,
                query_execution_time_minutes=experiment_data_row.QueryExecutionTimeMinutes,
                duration=experiment_data_row.Duration,
                llm_duration=experiment_data_row.LLM_duration,
                prompt_tokens=experiment_data_row.Prompt_tokens,
                completion_tokens=experiment_data_row.Completion_tokens,
                total_tokens=experiment_data_row.Total_tokens,
                examples=experiment_data_row.Examples,
                model=experiment_data_row.Metadata.label,
                provider=experiment_data_row.Metadata.provider,
                developer=experiment_data_row.Metadata.developer,
                prompt_strategy=experiment_data_row.Metadata.promptStrategy,
                sample_document_limit=experiment_data_row.Metadata.sampleDocumentLimit,
                generate_collection_schemas=experiment_data_row.Metadata.generateCollectionSchemas,
                few_shot_prompt=is_few_shot_prompt(
                    experiment_data_row.Metadata.promptStrategy),
                chain_of_thought_prompt=is_chain_of_thought_prompt(
                    experiment_data_row.Metadata.promptStrategy)
            )

            validated_data.append(experiment_data_csv_out)

        except ValidationError as e:
            print(f"Validation error for data: {data_dict}")
            print(e)

    return validated_data


def write_to_csv(validated_data: List[ExperimentDataRow], filename: str):
    if not validated_data:
        print("No data to write.")
        return

    # Extract headers from the Pydantic model
    headers = validated_data[0].model_dump().keys()

    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        for data in validated_data:
            writer.writerow(data.model_dump())


with open('experiments.txt', 'r', encoding='utf-8') as file:
    data = file.read()
    out = process_line_separated_data(data)
    data_dicts = make_data_dicts(out)
    validated_data = validate_and_convert(data_dicts)
    file_name = os.path.join("data_out", "experiments.csv")
    write_to_csv(validated_data, file_name)
    # TODO: write the validated data out to CSV
    pprint(f"Wrote to file {file_name}")
